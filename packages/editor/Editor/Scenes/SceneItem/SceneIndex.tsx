import Icon from '@ant-design/icons';
import { ISceneState, useImbot, useSubscribe } from '@editor/aStore';
import { videoLayer, videoType, videoTypeName } from '@editor/type4';
import { cleanProject } from '@editor/utils';
import { TitleTip } from '@editor/views';
import { Help } from '@icon-park/react';
import { theme } from 'antd';
import { css, cx } from 'emotion';
import { memo, useState } from 'react';
import './style.scss';

const useSceneMessage = (orderId: number, { loading, playable }: ISceneState['editor']) => {
  const [titleContent, setTitleContent] = useState<{ title: string; content: string } | void>();
  useSubscribe(getState => {
    try {
      const { project } = getState();
      if (project.settings.typeOfPlay !== 4) {
        const { scenes } = cleanProject(getState().project);
        if (!scenes.find(scene => scene.orderId === orderId)) {
          return setTitleContent({
            title: '未用场景',
            content:
              '当前场景没有被使用，该场景包含的转化按钮以及图片素材等都将被忽略不计。如需使用当前场景，请确保从主场景用“切换场景”事件直接或间接跳转至当前场景。',
          });
        }
        return setTitleContent();
      }
      const layers = videoLayer(project.scenes);
      const type = videoTypeName(videoType(orderId, project.scenes));
      return setTitleContent({
        title: `${layers[orderId] ?? ''} ${type}`,
        content: `${type}视频，层级${layers[orderId]}`,
      });
    } catch (e) {
      console.error(e);
    }
  }, 1600);
  if (playable) {
    return {
      title: '加载页',
      content: '加载页不支持复制、删除、移动页面顺序。此页面的配置信息由抖音端在加载直出互动时进行播放',
    };
  }
  if (loading) {
    return {
      title: '加载页',
      content: '加载页面不支持复制、删除、移动页面顺序。此页面只在加载较慢的情况下出现，理想情况下不出现',
    };
  }
  return titleContent;
};

export default memo(({ index, editor, orderId }: { orderId: number; index: number; editor: ISceneState['editor'] }) => {
  const { showImDialog } = useImbot();

  const message = useSceneMessage(orderId, editor);
  const { token } = theme.useToken();

  if (!message) {
    return (
      <div
        className={cx(
          'scene-item-index',
          css({
            background: token.colorBgMask,
          })
        )}
      >
        {`${index}`.padStart(2, '0')}
      </div>
    );
  }
  const { title, content } = message;
  return (
    <div
      className={cx(
        'scene-item-loading',
        css({
          background: token.colorBgMask,
        })
      )}
    >
      {title}
      &nbsp;
      <TitleTip title={content + '(点击?查看详细解释)'} placement="bottomLeft">
        <Icon
          component={Help as any}
          onClick={event => {
            event.stopPropagation();
            showImDialog(title);
          }}
        />
      </TitleTip>
    </div>
  );
});
