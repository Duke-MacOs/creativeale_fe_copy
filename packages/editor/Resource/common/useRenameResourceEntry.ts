import { useStore } from 'react-redux';
import { renameUserMaterial } from '@shared/api/library';
import { message } from 'antd';
import { Category, changeProvider, Provider } from '../../aStore';

const onRenameResourceEntry = () => {
  const { dispatch } = useStore<EditorState, EditorAction>();
  return async (
    category: Category,
    provider: Provider,
    id: string | number,
    name: string,
    setGroupData: any,
    groupData: any
  ) => {
    try {
      await renameUserMaterial([{ id, name }]);
      const index = groupData.list.findIndex((entry: any) => entry.id === id);
      const temp = groupData;
      temp.list[index].name = name;
      setGroupData({ ...temp });
      if (provider === 'project') {
        dispatch(changeProvider(category, 'private'));
      } else {
        dispatch(changeProvider(category, 'project'));
      }
      dispatch(changeProvider(category, provider));
      message.success(`重命名成功`);
    } catch (err) {
      message.error(`${err}`);
    }
  };
};
export default onRenameResourceEntry;
