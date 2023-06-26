import React, { useEffect } from 'react';
import { useStore } from 'react-redux';
import { classnest, getScene, getSelectedIds } from '@editor/utils';
import { useDebounceFn } from '@byted/hooks';
import { playScript } from '@editor/aStore';
import { cloneDeep, isNil } from 'lodash';
import { IScriptData } from '@byted/riko';
import { setStorage } from './storage';
import chunk from 'lodash/chunk';
import './style.scss';

export const CNP = 'effect-changer';

export interface EffectItemProps {
  script: string;
  name: string;
  duration: number;
  props?: any;
}

export interface EffectPaneProps {
  data: Array<EffectItemProps>;
  icons: { [key: string]: string };
  defaultIcon: string;
  active?: string;
  group: string;
  keyword: string;
  title?: string;
  onQueryChange?(effectType: string, count: number): void;
  onClick(props: IScriptData['props']): void;
}

export default ({
  onQueryChange,
  onClick,
  defaultIcon,
  keyword,
  active,
  icons,
  group,
  title,
  data,
}: EffectPaneProps) => {
  const { onStartPreview, onStopPreview } = usePreviewScript();
  const showData = keyword
    ? data.filter(value => {
        return value.name.includes(keyword);
      })
    : data;

  useEffect(() => {
    if (keyword) {
      onQueryChange?.(group, showData.length);
    }
  }, [showData, keyword, group, onQueryChange]);

  return showData.length > 0 ? (
    <React.Fragment>
      {title && <div className={`${CNP}-effect-title`}>{title}</div>}
      <div style={{ padding: '0 0 16px' }}>
        {chunk(showData, 5).map((data, index) => (
          <div key={index} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {data.map(({ script, name, duration, props }, index) => (
              <div
                key={index}
                className={classnest({ [`${CNP}-effect-item`]: 1, active: `${script}_${name}` === active })}
                // __script 对应属性编辑中动效类型级联选择器路径
                onClick={() => {
                  if (!isNil(group)) {
                    setStorage(group, { script, name });
                  }
                  onClick({ script, name, duration, __script: [group, `${script}_${name}`], ...cloneDeep(props) });
                }}
                onMouseLeave={onStopPreview}
                onMouseEnter={() => {
                  onStartPreview({ script, name, duration, props });
                }}
              >
                <div>
                  <img src={(icons[name] || (defaultIcon as any))['default']} alt={name} />
                </div>
                <div>{name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </React.Fragment>
  ) : null;
};

const usePreviewScript = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    onStopPreview: () => {
      dispatch(playScript({ scriptId: 0 }));
    },
    onStartPreview: useDebounceFn((props: any) => {
      const {
        editor: { selected },
      } = getScene(getState().project);
      const {
        nodeIds: [nodeId],
      } = getSelectedIds(selected);
      dispatch(
        playScript({
          script: {
            nodeId,
            scriptData: {
              id: 0,
              type: 'Effect',
              props: cloneDeep(props),
            },
          },
        })
      );
    }, 400).run,
  };
};
