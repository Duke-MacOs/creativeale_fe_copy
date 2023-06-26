import { CellContext, Spark } from '@editor/Editor/Property/cells';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { EventList } from './EventList';
import { Button, Tooltip } from 'antd';
import { useContext } from 'react';
import { SparkFn } from '../..';
import { amIHere } from '@shared/utils';

export * as EVENTS from './eventGroups';
export * from './common';

const noScriptUrl = (data: any): boolean => {
  if (Array.isArray(data)) {
    return data.every(noScriptUrl);
  }
  if (!data || typeof data !== 'object') {
    return true;
  }
  const { script, url } = data;
  if (script === 'CustomScript') {
    return true;
  }
  if (url) {
    return false;
  }
  return noScriptUrl(Object.values(data));
};

export const eventGroup: SparkFn = (_, envs): Spark => {
  return {
    spark: 'group',
    label: '响应事件',
    extra: {
      spark: 'check',
      index: 'scripts',
      hidden: amIHere({ release: true }),
      check: {
        hidden: noScriptUrl,
      },
      content: {
        spark: 'value',
        index: 'preload',
        content(preload = false, onChange) {
          return {
            spark: 'element',
            content() {
              return (
                <Tooltip title={preload ? '已设置预加载' : '设置预加载'}>
                  <Button
                    size="small"
                    type={preload ? 'link' : 'text'}
                    icon={<CloudDownloadOutlined />}
                    onClick={() => onChange(!preload)}
                  />
                </Tooltip>
              );
            },
          };
        },
      },
    },
    content: {
      spark: 'value',
      index: 'scripts',
      content: (scripts: any[], onChange: any) => {
        const {
          openKeys: { checking, enabled },
        } = useContext(CellContext);
        return {
          spark: 'element',
          content: () => {
            return (
              <EventList
                checking={checking}
                enabled={enabled}
                checked={envs.rootType === 'Scene'}
                scripts={scripts}
                onChange={onChange}
              />
            );
          },
        };
      },
    },
  };
};
