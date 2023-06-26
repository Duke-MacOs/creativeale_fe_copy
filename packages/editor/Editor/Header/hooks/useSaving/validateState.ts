import { getMainScene } from '@editor/utils';
import { throwColorful } from '@shared/utils';
import { Modal } from 'antd';
import store, {
  ICaseState,
  checkSceneCompliance,
  checkUseStringAccept,
  checkSceneCompProps,
  checkDownloadOpacity,
  checkStateDownloadText,
  changeCategory,
  checkPlayableScene,
  checkDirectDownloadScript,
  checkPlayableVideoState,
} from '@editor/aStore';

export const validateStateOrThrow = async (state: ICaseState, action: string) => {
  if (['同步', '导出', '发布', '送审'].includes(action)) {
    try {
      checkPlayableVideoState(state);
    } catch (error) {
      throwColorful(error.message, `，请修改后再${action}`);
    }
    const loadScene = state.scenes.find(({ editor }) => editor.loading);
    if (loadScene) {
      for (const message of checkPlayableScene(loadScene)) {
        throwColorful(message, `，请设置后再${action}`);
      }
    }
    const mainScene = getMainScene(state.scenes);
    if (mainScene && !mainScene.nodes.length) {
      throwColorful('主场景', { text: mainScene.name }, `没有节点，不能${action}`);
    }
    if (state.settings.typeOfPlay === 0) {
      for (const message of checkDownloadOpacity(state)) {
        if (await message) {
          throwColorful((await message)!, `，请修改后再${action}`);
        }
      }
    }
    if (state.settings.typeOfPlay === 3 && ![2, 3].includes(state.settings.category as number)) {
      if (!checkDirectDownloadScript(state).length) {
        throwColorful(`直出互动素材必须设置“调起下载组件”事件，请修改后再${action}`);
      }
    }
    for (const scene of state.scenes) {
      for (const { message } of checkUseStringAccept(scene)) {
        throwColorful(message, `，请修改后再${action}`);
      }
    }
    if (state.editor.sceneMode !== 'Product') {
      if (state.settings.typeOfPlay === 0) {
        for (const scene of state.scenes) {
          for (const { message } of checkSceneCompliance(scene)) {
            throwColorful(message, `，请修改后再${action}`);
          }
        }
        if ((await checkStateDownloadText(state)) === 0) {
          await new Promise<void>((resolve, reject) => {
            Modal.confirm({
              title: '素材没有转化按钮',
              content: `当前素材没有转化按钮，投放后将无法完成转化行为(后果严重)。请检查后再${action}。`,
              onCancel() {
                resolve();
              },
              cancelText: `无需转化，继续${action}`,
              onOk() {
                store.dispatch(changeCategory('Button'));
                reject(new Error(`请添加转化按钮后再${action}`));
              },
              okText: `添加转化按钮`,
            });
          });
        }
      }
    } else if (state.editor.protectedTemplate) {
      for (const scene of state.scenes) {
        for (const message of checkSceneCompProps(scene)) {
          throwColorful(message, `，请替换后再${action}`);
        }
      }
    }
  }
};
