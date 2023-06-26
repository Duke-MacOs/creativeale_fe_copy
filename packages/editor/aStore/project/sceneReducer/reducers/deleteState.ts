import { IProps, ISceneState } from '../../types';
const ACTION = Symbol('DeleteState');
export const deleteState = (id: number) => {
  return {
    type: ACTION,
    id,
  };
};
export default (scene: ISceneState, action: ReturnType<typeof deleteState>): ISceneState => {
  if (action.type === ACTION) {
    const {
      props,
      editor: { state = [], stateId },
    } = scene;
    const newState = state.filter(({ id }) => id !== action.id);
    const willRemovedScripts: number[] = [];

    return {
      ...scene,
      props: Object.fromEntries(
        Object.entries(props)
          .map(([id, props]) => {
            return [
              id,
              {
                ...props,
                state: props.state
                  ? Object.fromEntries(
                      Object.entries(props.state).filter(([stateId, state]) => {
                        if (Number(stateId) === action.id) {
                          state.scripts?.forEach(script => {
                            willRemovedScripts.push(script.id);
                          });
                        }
                        return Number(stateId) !== action.id;
                      })
                    )
                  : undefined,
                compProps: props.compProps
                  ? props.compProps.map(({ state, ...rest }) => ({
                      ...rest,
                      state: state
                        ? Object.fromEntries(Object.entries(state).filter(([stateId]) => Number(stateId) !== action.id))
                        : undefined,
                    }))
                  : undefined,
              } as IProps,
            ] as [string, IProps];
          })
          .filter(([id]) => !willRemovedScripts.includes(Number(id)))
      ),
      editor: { ...scene.editor, state: newState, stateId: stateId === action.id ? undefined : stateId },
    };
  }
  return scene;
};
