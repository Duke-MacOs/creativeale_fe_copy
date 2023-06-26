import React, { useState, memo } from 'react';
import { useSelector, useStore } from 'react-redux';
import { css } from 'emotion';
import dayjs from 'dayjs';
import zhCN from 'dayjs/locale/zh-cn';
import { restoreState, useEditor } from '@editor/aStore';
import useHistory, { editSceneHistory, IHistoryRow } from './hooks';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Star } from '@icon-park/react';
import { Spin, Empty, theme } from 'antd';
import { useForceSceneReload } from '@editor/Preview';

dayjs.extend(relativeTime);

function History() {
  const { selectedSceneId } = useEditor(0, 'selectedSceneId');
  const { loading, histories } = useHistory(selectedSceneId);
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div
      className={css({
        boxSizing: 'border-box',
        flex: '0 0 164px',
        maxWidth: '164px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'hidden',
        padding: '0 10px',
        '&:hover': {
          overflowY: 'scroll',
          padding: '0 0 0 10px!important',
        },
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          height: '30%',
          border: '3px solid #fff',
          borderRadius: 10,
        },
      })}
    >
      {loading ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      ) : histories?.length !== 0 ? (
        histories.map(history => {
          return (
            <HistoryItem selected={selected} setSelected={setSelected} history={history} key={history.historyId} />
          );
        })
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </div>
  );
}

export default memo(History);

function HistoryItem({
  selected,
  setSelected,
  history,
}: {
  selected: number | null;
  setSelected: any;
  history: IHistoryRow;
}) {
  const { historyId, scene, cover, createTime } = history;
  const [star, setStar] = useState<0 | 1>(history.star);
  const project = useSelector(({ project }: EditorState) => project);
  const { dispatch } = useStore<EditorState>();
  const loadScene = useForceSceneReload();
  const { token } = theme.useToken();

  return (
    <section
      key={historyId}
      className={css({
        padding: '8px 6px',
        flexShrink: 0,
        backgroundColor: selected === createTime ? token.colorPrimaryBg : token.colorBgContainer,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      })}
      onClick={() => {
        const selectedSceneIndex = project.scenes.findIndex(item => item.id === scene.id);
        const newScenes = project.scenes.slice();
        newScenes.splice(selectedSceneIndex, 1, scene);
        const { prevState } = project.editor;
        setSelected(createTime);
        dispatch(
          restoreState({
            ...project,
            type: 'History',
            scenes: newScenes,
            editor: {
              ...project.editor,
              prevState: { ...(prevState || project) },
            },
          })
        );
        loadScene();
      }}
    >
      <div
        className={`${css({
          width: 132,
          height: 234,
          backgroundSize: 'cover',
          border:
            selected === createTime
              ? `1px solid ${token.colorPrimaryBorderHover}`
              : `1px solid ${token.colorBorderSecondary}`,
          position: 'relative',
          backgroundImage: `url(${cover})`,
        })}`}
      >
        <Star
          theme="two-tone"
          size="24"
          fill={['#333', star ? token.colorError : token.colorBgContainer]}
          strokeWidth={2}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            transition: 'all 3s',
          }}
          onClick={() => {
            if (historyId) {
              editSceneHistory(historyId, {
                star: Number(!star) as 0 | 1,
              });
            }
            setStar(Number(!star) as 0 | 1);
          }}
        />
      </div>
      <div style={{ fontSize: 14, padding: '6px 0' }}>{dayjs(new Date(createTime)).locale(zhCN).fromNow()}</div>
    </section>
  );
}
