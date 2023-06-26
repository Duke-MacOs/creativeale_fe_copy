import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { findById, getNodes, getScene, isAnimation } from '@editor/utils';
import { shallowEqual, useSelector } from 'react-redux';
import { formulaSpark } from '../../../../common/formulaSpark';
import { useCurrentNodeId, useNodeOptions } from '../../../groups/customGroups/NodeCell';
import { IEventDesc, targetId_SPARK, time_SPARK } from '../common';
import { highlight } from '../common/highlight';

export const ChangeState: IEventDesc = {
  name: '切换状态',
  category: '常用',
  checkRef: ({ targetId }, nodeIds) => {
    return nodeIds.includes(targetId!);
  },
  checkError: ({ targetId, value }) => {
    if (targetId === undefined) {
      return '未设置目标节点';
    }

    if (value === undefined) {
      return '未设置目标状态';
    }
    return '';
  },
  Summary: ({ props: { targetId } }): JSX.Element => {
    const options = useNodeOptions();
    const node = options.find(opt => opt.value === targetId);
    return node ? (
      <>
        切换 {highlight(node?.label)} {isAnimation(node.type) ? '状态' : '动画片段'}
      </>
    ) : (
      <>请选择目标节点</>
    );
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        {
          spark: 'grid',
          content: [
            targetId_SPARK,
            {
              spark: 'check',
              index: 'targetId',
              check: {
                options: targetId =>
                  useSelector(({ project }: EditorState) => {
                    const currentId = useCurrentNodeId();
                    const scene = getScene(project);
                    const sceneNodes = getNodes(scene);
                    const [target] = findById(sceneNodes, targetId === -1 ? currentId : targetId);
                    if (target) {
                      if (isAnimation(target.type)) {
                        const options = target.editor?.state?.map(({ name, id }) => ({ label: name, value: id }));
                        if (options?.every(opt => opt.value !== -1)) {
                          options.push({
                            label: '默认状态',
                            value: -1,
                          });
                        }
                        return options;
                      }
                      if (target.scripts.some(script => script.type === 'Controller')) {
                        return (
                          (target.editor?.animations || target.editor?.layerAnimations?.[0])?.map(([animName]) => ({
                            label: animName,
                            value: String(animName),
                          })) || []
                        );
                      }
                      return [];
                    }
                    return [];
                  }, shallowEqual),
                label: targetId =>
                  useSelector(({ project }: EditorState) => {
                    const scene = getScene(project);
                    const sceneNodes = getNodes(scene);
                    const [target] = findById(sceneNodes, targetId);
                    if (target) {
                      if (isAnimation(target.type)) {
                        return '组件状态';
                      }
                      if (target.scripts.some(script => script.type === 'Controller')) {
                        return '动画片段';
                      }
                      return '状态';
                    }
                    return '状态';
                  }),
              },
              content: {
                spark: 'select',
                label: '状态',
                index: 'value',
              },
            },
          ],
        },
      ],
    },
  },
};
