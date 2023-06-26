import { useStore } from 'react-redux';
import { Category, changeDatabase, Provider, ResourceEntry, useEmitter, useUserInfo } from '../../aStore';

export default () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const emitter = useEmitter('ResourceAdded');
  const userinfo = useUserInfo();

  return (category: Exclude<Category, '' | 'shape'>, provider: Provider, groupName: string, entry: ResourceEntry) => {
    const data = getState().resource.database[category][provider];
    emitter(entry.id);
    dispatch(
      changeDatabase(
        category,
        provider,
        data.map(group =>
          group.name !== groupName ? group : { ...group, list: [{ ...entry, userId: userinfo?.userId }, ...group.list] }
        )
      )
    );
  };
};
