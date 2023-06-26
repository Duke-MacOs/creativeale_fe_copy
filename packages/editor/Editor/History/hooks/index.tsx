import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ICaseState, ISceneState, useEmitter, useProject } from '@editor/aStore';
import { getScene } from '@editor/utils';
import Dexie from 'dexie';
import { ITabState } from '@webIde/store';

export class HistoryDatabase extends Dexie {
  histories: Dexie.Table<IHistoryRow, number>;
  customScript: Dexie.Table<ICustomScriptRow, number>;

  constructor() {
    super('HistoryDatabase');
    this.version(3).stores({
      histories: '++historyId, projectId, sceneId, createTime, star',
    });
    this.version(3).stores({
      customScript: '++historyId, projectId, id, createTime',
    });
    // 后面再新增表格需要设置 version(4)
    this.histories = this.table('histories');
    this.customScript = this.table('customScript');
  }
}

export interface ICustomScriptRow extends ITabState {
  historyId?: number;
  createTime: number;
  isLocked: boolean;
}

export interface IHistoryRow {
  historyId?: number;
  projectId: number;
  sceneId: number;
  scene: ISceneState;
  cover: string | undefined;
  /**
   * 0: unlike
   *
   * 1: like
   */
  star: 0 | 1;
  createTime: number;
  extra?: any;
}

export const db = new HistoryDatabase();

/**
 * 添加场景的历史记录
 * @param projectId 项目ID
 * @param sceneId 场景ID
 * @param newHistory 历史记录
 */
export async function addSceneHistory(projectId: ICaseState['id'], sceneId: ISceneState['id'], scene: ISceneState) {
  const history = {
    projectId,
    sceneId,
    scene: {
      ...scene,
      history: {
        redoStack: [],
        undoStack: [],
      },
    },
    cover: scene.editor.capture || '',
    star: 0 as const,
    createTime: Date.now(),
  };

  const sceneMaxLength = 150;
  const sceneClearStep = 50;
  const maxLength = 20000;
  const clearStep = 2000;
  try {
    db.transaction('rw', db.histories, async () => {
      await db.histories.add(history);
      db.histories
        .where({
          projectId,
          sceneId,
        })
        .count()
        .then(sceneCount => {
          if (sceneCount > sceneMaxLength) {
            db.histories.where({ projectId, sceneId, star: 0 }).limit(sceneClearStep).delete();
          }
        });
      db.histories.count().then(count => {
        if (count >= maxLength) {
          db.histories.where({ star: 0 }).limit(clearStep).delete();
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 获取场景的历史记录
 * @param projectId 项目ID
 * @param sceneId 场景ID
 * @returns 当前项目被选中的场景的所有历史记录
 */
export async function getSceneHistories(projectId: ICaseState['id'], sceneId: ISceneState['id']) {
  try {
    return db.transaction('rw', db.histories, async () => {
      return db.histories.where({ projectId, sceneId }).toArray();
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 编辑场景的历史记录
 * @param projectId
 * @param sceneId
 * @param historyId
 * @param extra
 * @returns
 */
export async function editSceneHistory(historyId: number, extra: Partial<IHistoryRow>) {
  try {
    db.transaction('rw', db.histories, async () => {
      db.histories.update(historyId, extra);
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 清空项目的所有场景的历史记录
 * @param projectId
 * @param sceneId
 */
export async function cleanProjectHistories(projectId: ICaseState['id']) {
  try {
    db.transaction('rw', db.histories, async () => {
      db.histories.where({ projectId, star: 0 }).delete();
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 清空场景的历史记录
 * @param projectId
 * @param sceneId
 */
export async function cleanSceneHistories(projectId: ICaseState['id'], sceneId: ISceneState['id']) {
  try {
    db.transaction('rw', db.histories, async () => {
      db.histories.where({ projectId, sceneId, star: 0 }).delete();
    });
  } catch (err) {
    console.log(err);
  }
}

export const getSceneById = (project: ICaseState, sceneId: ISceneState['id']) => {
  return project.scenes.find(scene => scene.id === sceneId);
};

/**
 * 项目自动保存的同时记录数据（限制了频次）
 * @returns
 */
export function useAutoRecord() {
  /**
   * 自动记录间隔
   */
  const ref = useRef(Date.now());

  return useCallback((project: ICaseState) => {
    const oldTime = ref.current;
    const newTime = Date.now();
    if (newTime - oldTime > 10 * 1000) {
      const {
        id,
        type,
        editor: { selectedSceneId },
      } = project;
      if (type === 'Project') {
        const scene = getScene(project);
        addSceneHistory(id, selectedSceneId, scene);
        ref.current = newTime;
      }
    }
  }, []);
}

/**
 * 获取某个场景的所有历史记录
 * @param sceneId 场景ID
 * @returns histories
 */
export default function useHistory(sceneId: ISceneState['id']) {
  const [loading, setLoading] = useState(false);
  const id = useProject('id');
  const [histories, setHistories] = useState<IHistoryRow[]>([]);
  const fetchHistories = (id: number, sceneId: ISceneState['id']) => {
    setLoading(true);
    try {
      getSceneHistories(id, sceneId).then(histories => {
        if (histories) {
          setHistories(histories);
        }
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchHistories(id, sceneId);
  }, [id, sceneId]);
  useEmitter('CleanIndexedDB', () => {
    fetchHistories(id, sceneId);
  });
  return {
    loading,
    histories: useMemo(
      () =>
        histories.sort((a, b) => {
          if (a.star === b.star) {
            return b.createTime - a.createTime;
          } else {
            return b.star - a.star;
          }
        }),
      [histories]
    ),
  };
}

/**
 * 获取历史场景数据
 *
 * window.replaceSelectedScene(await getSceneByHistoryId(historyId))
 * @param historyId
 * @returns
 */
export async function getSceneByHistoryId(historyId: number) {
  try {
    return db.transaction('rw', db.histories, async () => {
      return (await db.histories.where({ historyId }).toArray())[0]?.scene;
    });
  } catch (err) {
    console.log(err);
  }
}

window.getSceneByHistoryId = getSceneByHistoryId;
