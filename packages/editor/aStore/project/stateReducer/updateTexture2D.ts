import { ICaseState } from '../types';

export const Update_TEXTURE2D = Symbol('UpdateTexture2D');

// action 创建函数
export const updateTexture2D = (orderId: number, props: Record<string, any>) => {
  return { type: Update_TEXTURE2D, orderId, props };
};

const update = (state: ICaseState, orderId: number, props: Record<string, any>): ICaseState => {
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? update(state.editor.prevState, orderId, props) : undefined,
    },
    texture2Ds: state.texture2Ds.map(i =>
      i.orderId !== orderId
        ? i
        : {
            ...i,
            props: {
              ...i.props,
              ...props,
            },
          }
    ),
  };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, orderId, props }: ReturnType<typeof updateTexture2D>
): ICaseState {
  return type === Update_TEXTURE2D ? update(state, orderId, props) : state;
}
