import render, { getIndexer } from '@editor/Editor/Property/cells';
import { highlight, IEventDesc } from '../common';
import { Effect as EffectSpark } from '../../../Effect';
import { useCurrentNodeId, useNodeById } from '../../../groups/customGroups/NodeCell';
import { useEditor } from '@editor/aStore';

export const Effect: IEventDesc = {
  name: '动画效果',
  category: '常用',
  extraProps: ({ enableBlueprint } = {}) => ({
    __script: ['baseEffect', 'AlphaTo_透明动画'],
    name: '透明动画',
    alpha: 0,
    time: 0,
    loop: false,
    duration: 1000,
    targetId: enableBlueprint ? undefined : -1,
  }),
  checkRef: ({ targetId }, nodeIds) => {
    return nodeIds.includes(targetId!);
  },
  Summary: ({ props: { name, targetId } }) => {
    const currentId = useCurrentNodeId();
    const node = useNodeById(targetId === -1 ? currentId : (targetId as number));
    return name ? (
      <>
        {node && highlight(node.name)} 播放 {highlight(name)}
      </>
    ) : null;
  },
  content: {
    spark: 'value',
    index: 'props',
    content(props, onChange) {
      return {
        spark: 'value',
        index: 'id',
        content(id) {
          return {
            spark: 'context',
            content: {
              spark: 'element',
              content() {
                const { enableBlueprint } = useEditor(0, 'enableBlueprint');

                return render(
                  EffectSpark(
                    { id, type: 'Effect' },
                    { rootType: 'PlayEffect', isRoot: false, propsMode: 'Project', enableBlueprint }
                  )
                );
              },
            },
            provide: () => {
              return {
                useValue: index => {
                  const { indexValue, indexEntries } = getIndexer(index);
                  return {
                    value: [indexValue(props)],
                    onChange([value], { replace, ...options } = {}) {
                      if (!replace) {
                        onChange({ ...props, ...Object.fromEntries(indexEntries(value)) }, options);
                      } else {
                        onChange({ ...value, targetId: props.targetId }, options); // options replace
                      }
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  },
};
