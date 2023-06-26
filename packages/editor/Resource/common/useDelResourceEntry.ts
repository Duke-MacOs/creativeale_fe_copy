import { useStore } from 'react-redux';
import { deleteUserMaterial } from '@shared/api/library';
import { Category, changeDatabase, Provider, ResourceEntry, useEmitter } from '../../aStore';
import { relativeUrl } from '@shared/utils';
import { cloneDeep, omit } from 'lodash';
import { useDeleteSceneResource } from '../entries/3d/Particle3D/hooks';
import useCubemap from '../entries/3d/Cubemaps/useCubemap';

const onDelResourceEntry = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const emitter = useEmitter('ResourceDeleted');
  return async (
    category: Exclude<Category, '' | 'shape'>,
    provider: Provider,
    id: number | string | Array<number | string>
  ) => {
    const deleteIds = Array.isArray(id) ? id : [id];
    await deleteUserMaterial(deleteIds);
    const data = getState().resource.database[category][provider];
    deleteIds.forEach(id => emitter(id));
    dispatch(
      changeDatabase(
        category,
        provider,
        data.map(group => {
          const list = group.list.filter(entry => !deleteIds.includes(entry.id));
          if (group.list.length && group.list.length !== list.length) {
            return { ...group, list, total: group.total - 1 };
          }
          return group;
        })
      )
    );
  };
};

export const useCleanQuickly = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  const deleteResourceEntry = onDelResourceEntry();
  const { onDeleteSceneResource: delComponent } = useDeleteSceneResource('Component');
  const { onDeleteSceneResource: delModel } = useDeleteSceneResource('Model');
  const { onDeleteSceneResource: delParticle3D } = useDeleteSceneResource('Particle3D');
  const { deleteCubemap } = useCubemap();

  return async (category: Exclude<Category, '' | 'shape'>, provider: Provider) => {
    if (['Animation', 'Animation3D', 'Model', 'Particle3D'].includes(category)) {
      getState()
        .project.scenes.filter(i => i.type === category)
        .forEach(s => {
          (category === 'Model' ? delModel : category === 'Particle3D' ? delParticle3D : delComponent)(s.orderId).catch(
            e => {
              console.log(e);
            }
          );
        });
      return;
    }
    if (category === 'Cubemaps') {
      getState().project.cubemaps.forEach(i => {
        deleteCubemap(i.id).catch(e => {
          console.log(e);
        });
      });
      return;
    }

    const list = getState().resource.database[category][provider].reduce((prev, cur) => {
      return Array.isArray(cur?.list) ? prev.concat(cur?.list) : prev;
    }, [] as ResourceEntry[]);

    // 排除 history 干扰
    const project: any = cloneDeep(getState().project);
    project.scenes = project.scenes.map((s: any) => omit(s, 'history'));

    const content = JSON.stringify(project);
    console.log('content:', content);

    // 删除一般资源
    const unUsedList = list
      .filter(({ previewUrl }) => {
        return typeof previewUrl === 'string' && !content.includes(relativeUrl(previewUrl));
      })
      .map((i: any) => i.id);
    if (unUsedList.length) {
      deleteResourceEntry(category, provider, unUsedList);
    }
  };
};

export default onDelResourceEntry;
