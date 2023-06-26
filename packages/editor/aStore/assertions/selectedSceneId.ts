export default ({ project }: EditorState) => {
  const {
    editor: { selectedSceneId },
    scenes,
  } = project;
  console.assert(
    scenes.find(({ id }) => id === selectedSceneId),
    'The selectedSceneId is not existing!'
  );
};
