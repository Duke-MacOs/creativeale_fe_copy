import { getScene } from '@editor/utils';

export default ({ project }: EditorState) => {
  const {
    editor: { moment },
  } = getScene(project);
  console.assert(moment >= 0, `The value of moment is ${moment}, which should not be less than 0!`);
};
