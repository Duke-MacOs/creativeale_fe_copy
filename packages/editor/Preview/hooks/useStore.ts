import { useSelector } from 'react-redux';
import { getScene } from '../../utils';

export default () => {
  const state = useSelector(({ project }: EditorState) => project);
  const scene = getScene(state, undefined, false);
  return {
    state,
    scene,
  };
};
