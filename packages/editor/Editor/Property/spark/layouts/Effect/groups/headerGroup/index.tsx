import { DeleteOutlined } from '@ant-design/icons';
import { enabledSpark } from '../../../groups/headerGroup/enabledSpark';
import { IGroupSpark } from '@editor/Editor/Property/cells';
import { AnimationPreview } from './AnimationPreview';
import { useOnDelete } from '@editor/aStore';
import { Button, Tooltip } from 'antd';
import { EffectFn } from '../../';
import { PlayScriptBtn } from '../../../Script/Event/components/PlayScriptBtn';
import { nodeId_SPARK, targetId_SPARK } from '../../../Script/Event/common';
import { collectEffect } from '@editor/common/EffectChanger/EffectList/collectEffect';

export const headerGroup: EffectFn = ({ id }, { rootType, enableBlueprint }): IGroupSpark => {
  return {
    spark: 'group',
    label: '动画效果',
    extra: {
      spark: 'flex',
      columnGap: 0,
      hidden: rootType === 'PlayEffect' || rootType === 'useEffect',
      content: [
        enabledSpark(),
        {
          spark: 'element',
          content: () => {
            const { onDelete } = useOnDelete();
            return (
              <Tooltip title="删除">
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => onDelete()} />
              </Tooltip>
            );
          },
        },
      ],
    },
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'value',
          index: 'name',
          content(name, onChange) {
            return {
              spark: 'value',
              index: ['nodeId', '_editor', '__script', 'time', 'duration', 'loop', 'loopInterval', 'loopTimes'],
              content([nodeId, _editor, __script, time, duration, loop, loopInterval, loopTimes]) {
                return {
                  spark: 'element',
                  content() {
                    return (
                      <AnimationPreview
                        name={name}
                        onChange={onChange}
                        effectInfo={__script}
                        onReplace={props => {
                          const effectNames = Array.from(
                            collectEffect(function* (effect) {
                              yield effect.name;
                            })
                          );
                          const loopProps =
                            loop && props.loop ? { loopInterval: loopInterval ?? 0, loopTimes: loopTimes ?? -1 } : {};
                          onChange(
                            {
                              ...props,
                              nodeId,
                              time,
                              duration,
                              ...loopProps,
                              _editor,
                              name: effectNames.every(n => n !== name) ? name : props.name,
                            },
                            { replace: true }
                          );
                        }}
                      />
                    );
                  },
                };
              },
            };
          },
        },
        {
          spark: 'grid',
          hidden: rootType !== 'PlayEffect',
          content: [
            {
              ...targetId_SPARK,
              hidden: enableBlueprint,
            },
            {
              ...nodeId_SPARK,
              hidden: !enableBlueprint,
            },
            {
              spark: 'element',
              content() {
                return <PlayScriptBtn id={id} />;
              },
            },
          ],
        },
      ],
    },
  };
};
