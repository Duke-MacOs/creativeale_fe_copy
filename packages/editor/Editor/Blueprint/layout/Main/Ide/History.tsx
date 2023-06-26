import { ICustomScriptRow } from '@editor/Editor/History/hooks';
import { deleteScriptHistory, getScriptHistoriesByTabId, lockScriptHistory } from '@webIde/History/indexDB';
import { css, cx } from 'emotion';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import zhCN from 'dayjs/locale/zh-cn';
import { DeleteOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';

export function History({
  id,
  width,
  selectedHistory,
  onSelectHistory,
}: {
  id: number;
  width: number;
  selectedHistory: ICustomScriptRow | null;
  onSelectHistory: (history: ICustomScriptRow | null) => void;
}) {
  const { histories, load } = useHistories(id);
  const [hoveredHistory, setHoveredHistory] = useState<ICustomScriptRow | null>(null);

  return (
    <div
      className={css({
        width,
        borderRight: '1px solid #d9d9d9',
        overflow: 'scroll',
      })}
    >
      {histories.map(history => {
        const { createTime } = history;
        const date = dayjs(new Date(createTime)).locale(zhCN).fromNow();
        return (
          <div
            key={history.historyId}
            className={cx(
              css({
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #d9d9d9',
                display: 'flex',
                justifyContent: 'center',
              }),
              selectedHistory?.historyId === history.historyId &&
                css({
                  background: 'rgb(132, 150, 251)',
                  color: '#fff',
                })
            )}
            onClick={() => {
              if (selectedHistory?.historyId === history.historyId) {
                onSelectHistory(null);
              } else {
                onSelectHistory(history);
              }
            }}
            onMouseOver={() => {
              setHoveredHistory(history);
            }}
            onMouseLeave={() => {
              setHoveredHistory(null);
            }}
          >
            <span>{date}</span>
            <Space className={css({ marginLeft: 'auto' })}>
              {hoveredHistory?.historyId === history?.historyId && (
                <Tooltip title="删除">
                  <DeleteOutlined
                    onClick={e => {
                      e.stopPropagation();
                      deleteScriptHistory(history.historyId).then(() => {
                        load();
                      });
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title="收藏">
                {history.isLocked ? (
                  <HeartFilled
                    className={css({
                      color: '#f44336',
                    })}
                    onClick={e => {
                      e.stopPropagation();
                      lockScriptHistory(history.historyId, !history.isLocked).then(() => {
                        load();
                      });
                    }}
                  />
                ) : (
                  <HeartOutlined
                    onClick={e => {
                      e.stopPropagation();
                      lockScriptHistory(history.historyId, !history.isLocked).then(() => {
                        load();
                      });
                    }}
                  />
                )}
              </Tooltip>
            </Space>
          </div>
        );
      })}
    </div>
  );
}

function useHistories(sceneId: number) {
  const [histories, setHistories] = useState<ICustomScriptRow[]>([]);
  const load = useCallback(() => {
    getScriptHistoriesByTabId(sceneId).then(histories => {
      if (histories) {
        setHistories(
          histories.sort((a, b) => {
            if (a.isLocked === b.isLocked) {
              return b.createTime - a.createTime;
            }
            return a.isLocked ? -1 : 1;
          })
        );
      }
    });
  }, [sceneId]);

  useEffect(() => {
    load();
  }, [load]);
  return { histories, load };
}
