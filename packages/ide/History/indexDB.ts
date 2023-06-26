import { ITabState } from '@webIde/store';
import { db, ICustomScriptRow } from '@editor/Editor/History/hooks';

const MaxScriptCount = 50;

/**
 * 添加脚本的历史记录
 * @param projectId 项目ID
 * @param customScriptId 场景ID
 * @param newHistory 历史记录
 */
export async function addScriptHistory(state: ITabState) {
  const history = {
    ...state,
    isLocked: false,
    createTime: Date.now(),
  };

  try {
    db.transaction('rw', db.customScript, () => {
      db.customScript
        .where({
          projectId: state.projectId,
          id: state.id,
        })
        .toArray()
        .then(data => {
          if (data.reverse()[0]?.resourceContent === history.resourceContent) {
            return false;
          }
          if (data.length > MaxScriptCount) {
            db.customScript
              .where({ projectId: state.projectId, id: state.id })
              .filter(script => script.isLocked === false)
              .limit(1)
              .delete();
          }
          db.customScript.add(history);
        });
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 通过文件 id 获取数据
 * @param projectId 项目ID
 * @param customScriptId 场景ID
 */
export async function getScriptHistoriesByTabId(id: ITabState['id']) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript.where({ id }).toArray();
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 通过 historyId 获取数据
 * @param historyId
 * @returns
 */
export async function getScriptHistoryById(historyId: ICustomScriptRow['historyId']) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript.where({ historyId }).first();
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 修改历史记录名称
 * @param historyId
 * @param name
 * @returns
 */
export async function changeScriptHistoryName(historyId: ICustomScriptRow['historyId'], name: string) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript.where({ historyId }).modify({ name });
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 锁定历史记录
 * @param historyId
 */
export async function lockScriptHistory(historyId: ICustomScriptRow['historyId'], lock: boolean) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript.where({ historyId }).modify({ isLocked: lock });
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 删除历史记录
 * @param historyId
 * @returns
 */
export async function deleteScriptHistory(historyId: ICustomScriptRow['historyId']) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript.where({ historyId }).delete();
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 删除文件的所有历史记录
 * @param fileId
 * @returns
 */
export async function deleteFileHistory(fileId: number) {
  try {
    return db.transaction('rw', db.customScript, async () => {
      return db.customScript
        .where({ id: fileId })
        .filter(script => script.isLocked === false)
        .delete();
    });
  } catch (err) {
    console.log(err);
  }
}
