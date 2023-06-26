import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { HeaderProps, highlightText } from '../../Header';
import { INodeState } from '@editor/aStore';
import { getScene, getNodes } from '@editor/utils';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';

export default (keyword: string) => {
  const nodes = useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const nodes = getNodes(scene);
    if (isVRCaseAndInEdit(project)) {
      if (scene.type === 'Animation3D') {
        return nodes[0].nodes.filter(i => i.type !== 'Scene3D');
      }

      return scene.editor.edit3d ? [] : nodes.filter(i => i.type !== 'Scene3D');
    } else {
      // 编辑"全景空间"时隐藏根节点
      if (project.type === 'PanoramaData') return nodes[0].nodes;
      if (!project.settings.enabled3d || scene.type !== 'Scene') {
        return nodes;
      }
      if (!scene.editor.edit3d) {
        return nodes.map(node => (node.type !== 'Scene3D' ? node : { ...node, nodes: [] }));
      }
      return nodes.filter(({ type }) => type === 'Scene3D');
    }
  }, shallowEqual);
  const filtered = useMemo(() => highlight(nodes, keyword), [nodes, keyword]);
  const flattened = useMemo(() => flattenNodes(filtered.slice().reverse()), [filtered]);
  return { nodes, filtered, flattened };
};

const highlight = (nodes: INodeState[], keyword: string) => {
  if (!keyword || !nodes.length) {
    return nodes;
  }
  return nodes.reduce((result, node) => {
    if (node.name.includes(keyword) || node.scripts.some(({ name }) => name.includes(keyword))) {
      result.push({
        ...node,
        name: highlightText(node.name, keyword) as string,
        scripts: node.scripts.map(script =>
          !script.name.includes(keyword) ? script : { ...script, name: highlightText(script.name, keyword) as string }
        ),
        nodes: highlight(node.nodes, keyword),
      });
    } else {
      const nodes = highlight(node.nodes, keyword);
      if (nodes.length) {
        result.push({
          ...node,
          nodes,
        });
      }
    }
    return result;
  }, [] as typeof nodes);
};
const flattenNodes = (
  nodes: INodeState[],
  depth = 1,
  depths = [] as number[],
  parentEnabled = true,
  parentVisible = true
) => {
  const maskIndex = nodes.map(({ asMask }) => asMask).lastIndexOf(true);
  return nodes.reduce(
    (
      flattened,
      {
        id,
        type,
        name = '',
        enabled = true,
        visible = true,
        asMask = false,
        nodes = [],
        scripts = [],
        editor: { isLocked, isHidden, isCollapsed } = {},
      },
      index
    ) => {
      const maskDepths = index < maskIndex ? depths.concat(depth) : depths;
      flattened.push({
        id,
        type,
        name,
        enabled: parentEnabled && enabled,
        visible: parentVisible && visible,
        children: nodes.length,
        depth,
        asMask,
        maskDepths,
        isLocked,
        isHidden,
        isCollapsed,
        scripts,
      } as any);
      if (!isCollapsed) {
        for (const node of flattenNodes(
          nodes.slice().reverse(),
          depth + 1,
          maskDepths,
          parentEnabled && enabled,
          parentVisible && visible
        )) {
          flattened.push(node);
        }
      }
      return flattened;
    },
    [] as HeaderProps['nodes']
  );
};
