import { ISceneState } from '@editor/aStore';
import { findById } from '@editor/utils';
import { toColorful } from '@shared/utils';

export function* checkSceneCompliance({ id, props, nodes, name: sceneName, editor }: ISceneState) {
  if (editor.loading && !nodes.length) {
    yield {
      type: `LoadingSceneEmpty:${id}`,
      message: toColorful('为保护用户体验，加载场景', { text: sceneName }, '不能没有节点内容'),
      warning: toColorful('为保护用户体验，加载场景', { text: sceneName }, '不能没有节点内容'),
    };
  }
  const textWidthChecker = getTextWidthChecker();
  const buttons = [] as (typeof props)[number][];
  for (const [id, prop] of Object.entries(props)) {
    const { type, fontSize = 30, text, name } = prop;
    if (type === 'Button') {
      buttons.push({ ...prop, ...resolvePosition({ props, nodes }, Number(id)) });
      if (textWidthChecker(prop)) {
        yield {
          type: `TextWidthTooLong:${id}`,
          message: toColorful(
            '为保护用户体验，场景',
            { text: sceneName },
            '的转化按钮',
            { text: name! },
            '文案宽度不能超过按钮区域'
          ),
          warning: toColorful('为保护用户体验，转化按钮', { text: name! }, '文案宽度不能超过按钮区域'),
        };
      }
      if (text && fontSize < 30) {
        yield {
          type: `ButtonFontTooSmall:${id}`,
          message: toColorful(
            '为保护用户体验，',
            { text: sceneName },
            `的转化按钮`,
            { text: name! },
            `字体大小不得小于30px`
          ),
          warning: toColorful('为保护用户体验，转化按钮', { text: name! }, `字体大小不得小于30px`),
        };
      }
    }
  }
  if (buttons.length > 3) {
    yield {
      type: `ButtonTooMany:${id}`,
      message: toColorful(
        '为保护用户体验，',
        { text: sceneName },
        '内转化按钮数量不得超过3个；',
        '当前',
        ...buttons
          .map(({ name }) => ({ text: name! }))
          .map(item => [item, '、'])
          .flat()
          .slice(0, -1),
        `共${buttons.length}个`
      ),
      warning: toColorful(
        '为保护用户体验，同一场景内转化按钮数量不得超过3个；',
        '当前',
        ...buttons
          .map(({ name }) => ({ text: name! }))
          .map(item => [item, '、'])
          .flat()
          .slice(0, -1),
        `共${buttons.length}个`
      ),
    };
  }
}

const resolvePosition = ({ nodes, props }: Pick<ISceneState, 'nodes' | 'props'>, nodeId: number) => {
  return findById(nodes, nodeId).reduce(
    (position, { id }) => {
      const { x = 0, y = 0 } = props[id];
      position.x += x;
      position.y += y;
      return position;
    },
    { x: 0, y: 0 }
  );
};

const getTextWidthChecker = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  return ({ text = '', fontSize = 16, italic = false, bold = false, width = 0 }: ISceneState['props'][number]) => {
    if (context) {
      context.font = `${italic ? 'italic' : 'normal'} normal ${bold ? 'bold' : 'normal'} ${fontSize}px sans-serif`;
      return context.measureText(text).width > width;
    }
    return false;
  };
};
