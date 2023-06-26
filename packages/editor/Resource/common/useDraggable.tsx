import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from 'react-redux';
import {
  Category,
  checkComponentCircleRef,
  Provider,
  useAddNode,
  useAddNodeWith3D,
  useOnAddScripts,
  useScene,
} from '../../aStore';
import { useScene as useSceneProps } from '@editor/Editor/Scenes/hooks/useScene';
import { ChangerContext } from '../../common/ResourceChanger';
import { newID, collectEvent, EventTypes } from '../../utils';
import { relativeUrl } from '@shared/utils';
import { useParticle3D } from '../entries/3d/Particle3D/hooks';
import { useModel } from '../entries/3d/Model/hooks';
import useCubemap from '../entries/3d/Cubemaps/useCubemap';
import { usePanoramaEdit } from '@editor/Template/Panorama/hooks';
import { ResourceType } from '../upload';

type DragData = {
  mime: string;
  url: string | number;
  name: string;
  orderId?: number;
  cover?: string;
  props?: Record<string, unknown>;
  version?: string | null;
  materialId?: string | number;
  provider?: Provider;
  extra?: Record<string, any>;
};

export default ({ mime, url, name, orderId, cover, props: defaultProps, materialId, provider, extra }: DragData) => {
  if (materialId && typeof url === 'string') {
    const url_ = new URL(url);
    url_.searchParams.set('mid', String(materialId));
    url = url_.href;
  }
  const onAddNode = useAddNode();
  const onAddNodeWith3D = useAddNodeWith3D();
  const onAddScripts = useOnAddScripts();
  const { onChange } = useContext(ChangerContext);
  const sceneEditor = useScene('editor');
  const { addParticle3DInEdit } = useParticle3D();
  const { addModelInEdit } = useModel();
  const { getState } = useStore<EditorState>();
  const [, drag] = useDrag({
    item: { type: 'resource', mime, url, name, cover, props: defaultProps },
  });
  const type = getState().project.type;
  const { scene3DApplyCubemap } = useCubemap();
  const { onChangeCurrentScene3DProps } = useSceneProps();
  const { createPanoramaHotSpot, createPanoramaSpaceNode } = usePanoramaEdit();

  if (onChange) {
    return {
      onClick() {
        if (provider === 'public' && mime) {
          collectEvent(EventTypes.UseResource, {
            type: ResourceType[mime as Category],
            material_id: Number(materialId),
          });
        }
        onChange({
          name,
          cover,
          orderId,
          url:
            typeof url === 'string'
              ? relativeUrl(url)
              : mime === 'Animation'
              ? checkComponentCircleRef(getState().project, url)
              : url,
          _from: 'resChanger',
          extra,
        });
      },
    };
  }
  return {
    ref: drag,
    onClick() {
      if (provider === 'public' && mime) {
        collectEvent(EventTypes.UseResource, {
          type: ResourceType[mime as Category],
          material_id: Number(materialId),
        });
      }
      if (mime === 'CustomScript') {
        if (Object.keys(sceneEditor.selected).length === 0) {
          return;
        }

        return onAddScripts('Script', {
          script: 'Auto',
          name: '自动触发',
          once: true,
          time: sceneEditor.moment,
          scripts: [
            {
              id: newID(),
              type: 'Script',
              props: {
                name: '自定义脚本',
                script: 'CustomScript',
                url,
                enabled: true,
                _resName: name,
              },
            },
          ],
        });
      }
      if (mime === 'Cubemaps') {
        onAddNodeWith3D(mime, () => {
          scene3DApplyCubemap(url, (orderId?: number) => {
            onChangeCurrentScene3DProps({
              skyboxMaterialUrl: orderId ?? 0,
              _editor: {
                skyboxCover: cover,
              },
            });
          });
        });
        return;
      }
      if (mime === 'Particle3D' && type === 'Particle3D') {
        addParticle3DInEdit(url);
        return;
      }
      if (mime === 'Model' && type === 'Model') {
        addModelInEdit(url);
        return;
      }
      if (mime === 'PanoramaSpace') {
        createPanoramaSpaceNode();
        return;
      }
      if (mime === 'PanoramaHotSpot') {
        createPanoramaHotSpot();
        return;
      }

      return onAddNodeWith3D(mime, () => {
        onAddNode(
          {
            mime,
            name,
            url,
            cover,
            extra,
            mapNode(node) {
              const props = { ...node.props, ...defaultProps };
              return { ...node, props };
            },
          },
          true
        );
      });
    },
  };
};
