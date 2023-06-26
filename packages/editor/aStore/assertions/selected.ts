import { findById, getNodes, getScene, getSelectedIds } from '@editor/utils';

export default ({ project }: EditorState) => {
  const scene = getScene(project);
  const {
    editor: { selected },
  } = scene;
  const nodes = getNodes(scene);
  const { scriptIds, nodeIds } = getSelectedIds(selected);
  if (scriptIds.length) {
    console.assert(
      scriptIds.map(scriptId => findById(nodes, scriptId, true).length).every(Boolean),
      'There are some scriptIds in selected but not exist in nodes!'
    );
  } else if (nodeIds.length) {
    const siblings = findById(nodes, nodeIds[0])[1]?.nodes || nodes;
    const selected = siblings.filter(({ id }) => nodeIds.includes(id));
    console.assert(
      selected.length === nodeIds.length,
      'There are some nodeIds in selected which are not at the same level or not exist in nodes!'
    );
  }
};
