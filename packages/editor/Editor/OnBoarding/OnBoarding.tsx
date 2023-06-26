import Icon from '@ant-design/icons';
import { useScene } from '@editor/Editor/Scenes/hooks/useScene';
import { StepGuider } from '@editor/views';
import { Tips } from '@icon-park/react';
import { useStore } from 'react-redux';

export const ONBOARD_STEP_1 = 'ONBOARD_STEP_1';
export const ONBOARD_STEP_2 = 'ONBOARD_STEP_2';
export const ONBOARD_STEP_3 = 'ONBOARD_STEP_3';
export const ONBOARD_STEP_4 = 'ONBOARD_STEP_4';
export const ONBOARD_STEP_5 = 'editor-property';
export const ONBOARD_STEP_6 = 'ONBOARD_STEP_6';

/**
 * 指引组件
 */
export const OnBoarding = ({ onClose }: { onClose: any }) => {
  const { getState } = useStore<EditorState>();
  const { onSelectScene } = useScene();
  const getTitle = (title: string) => {
    return (
      <>
        <Icon component={Tips as any} /> {title}
      </>
    ) as any;
  };

  return (
    <StepGuider
      onClose={onClose}
      steps={[
        {
          selector: `#${ONBOARD_STEP_1}`,
          title: getTitle('第一步：设置加载页'),
          parent: 'body',
          content: <div>这里是模板化的加载页，是整个直出互动素材的第1部分，需在右侧面板配置相关内容</div>,
          placement: 'right-top',
          beforeStepChange() {
            const sceneId = getState()
              .project.scenes.filter(({ type }) => type === 'Scene')
              .find(({ orderId }) => orderId === 2)?.sceneId;
            if (sceneId) {
              setTimeout(() => {
                onSelectScene(sceneId);
              });
            }
          },
        },
        {
          selector: `#${ONBOARD_STEP_2}`,
          title: getTitle('第二步：导入物料'),
          parent: 'body',
          content: <div>这里可以导入图片、视频、音乐等物料</div>,
          placement: 'right-top',
        },
        {
          selector: `#${ONBOARD_STEP_3}`,
          title: getTitle('第三步：添加空白场景'),
          parent: 'body',
          content: <div>这里可以添加新的空白场景，使内容更加丰富</div>,
          placement: 'right-top',
        },
        {
          selector: `#${ONBOARD_STEP_4}`,
          title: getTitle('第四步：在画布上放置物料'),
          parent: 'body',
          content: <div>这里是绘制区，每个场景都有一个绘制区，在这里可以布局你的物料</div>,
          placement: 'right-top',
        },
        {
          selector: `#${ONBOARD_STEP_5}`,
          title: getTitle('第五步：为物料设置样式和互动事件'),
          parent: 'body',
          content: <div>选中某个物料元素，然后在这里为它设置样式、动效，也可以为它添加互动行为以及响应事件</div>,
          placement: 'left-top',
        },
        {
          selector: `#${ONBOARD_STEP_6}`,
          title: getTitle('第六步：同步'),
          parent: 'body',
          content: <div>所有内容设置完成后，可以点“预览”来检查效果，确认没问题后即可点“同步”去投放啦！</div>,
          placement: 'bottom-right',
          offset: { x: 5, y: 0 },
        },
      ]}
    />
  );
};
