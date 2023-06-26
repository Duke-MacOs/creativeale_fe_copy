import { extraLib, modifyModel } from '@webIde/Ide/monacoUtils';
import { switchTag, useTab } from '@webIde/store';
import { message, Modal } from 'antd';
import { shallowEqual, useSelector, useStore } from 'react-redux';

export default () => {
  const { dispatch } = useStore();
  const { currentTab } = useSelector((state: any) => {
    const { workspace } = state.ide;
    return {
      currentTab: workspace.currentTab,
    };
  }, shallowEqual);
  const { tab, localSyncTab } = useTab(currentTab, true);

  const onApply = async (tag: any) => {
    if (tab && tag) {
      Modal.confirm({
        title: '标签覆盖',
        content: `是否将标签覆盖`,
        cancelText: '取消',
        onOk: () => {
          if (tag) {
            try {
              modifyModel(tab.name, tag.jscode);
              extraLib.add(tab.name, tag.jscode);
              dispatch(switchTag(null));
              localSyncTab();
              message.success('替换成功');
            } catch (error) {
              message.error(error);
            }
          }
        },
      });
    } else {
      message.error('文件已经被删除');
    }
  };

  return {
    onApply,
  };
};
