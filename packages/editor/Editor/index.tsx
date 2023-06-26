import React, { useEffect, useMemo } from 'react';
import { Alert, Checkbox, Layout, Spin, Modal, theme, ConfigProvider } from 'antd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDebugFlag } from '@shared/globals/debugHooks';
import { useImbot, useEditor, useProject, useIdeMessage, useSettings } from '../aStore';
import { useRememberVisible, useVisible } from '@editor/hooks';
import ContextMenu from '../common/ContextMenu';
import Elements from '../Elements';
import Property from './Property';
import NewResource from './Resource';
import Resource from '../Resource';
import Preview from '../Preview';
import History from './History';
import Toolbar from './Toolbar';
import Header from './Header';
import Scenes from './Scenes';
import { css, cx } from 'emotion';
import { LayerModal } from '../Elements/LayerCollisions';
import { useLayer } from '@editor/Elements/LayerCollisions/hooks';
import LatestNotice from '@shared/components/LatestNotice';
import VRHouseSideBar from '../Template/Panorama/SideBar';
import { usePanoramaEdit } from '../Template/Panorama/hooks';
import Blueprint from './Blueprint';
import { isVRCase, isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { useStore } from 'react-redux';
import { getSearchParams } from '@editor/utils';
import { TutorialModal } from './OnBoarding';
import useResumeGlobalVars from './Toolbar/RikoLog/hooks/useResumeGlobalVars';
import VrVideoResource from './VrVideoResource';
import { useInitialModel3D } from '@editor/Template/Model3D/hooks';
import ResourceModal from '@editor/ResourceModal';

const className = css({
  height: '100%',
  minWidth: 1080,
});
const spinStyle = css({
  '&, &>.ant-spin-container': {
    height: '100%',
  },
});

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <Layout.Content>Something went wrong.</Layout.Content>;
    }
    return this.props.children;
  }
}

const useHideComponent = () => {
  const hidePreviewer = useDebugFlag(
    {
      title: '隐藏可视画板',
      flagBit: 0b1000,
    },
    true
  );
  const hideProperty = useDebugFlag({
    title: '隐藏属性面板',
    flagBit: 0b10000,
  });
  const hideElements = useDebugFlag({
    title: '隐藏时间面板',
    flagBit: 0b100000,
  });
  const hideResource = useDebugFlag({
    title: '隐藏资源面板',
    flagBit: 0b1000000,
  });
  const hideScenes = useDebugFlag({
    title: '隐藏场景列表',
    flagBit: 0b10000000,
  });
  return {
    hidePreviewer,
    hideProperty,
    hideElements,
    hideResource,
    hideScenes,
  };
};

export default function Editor() {
  const { getState } = useStore();
  const { hidePreviewer, hideProperty, hideElements, hideResource, hideScenes } = useHideComponent();
  const { visible, remember, setVisible, setRemember } = useRememberVisible('componentWarning', { byStep: false });
  const [, setVisibleFlag] = useVisible('not_a_chrome');
  const { sceneMode } = useEditor(0, 'sceneMode');
  const enabled3d = useSettings('enabled3d');
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const id = useProject('id');
  const { loading, onChange: onChangeLoading } = useEditor(0, 'loading');
  const { playable } = useEditor('playable');
  const caseType = useProject('type');
  const { edit3d } = useEditor('edit3d');
  const { initialLayer } = useLayer();
  const { delSearchUrl, initialPanoramaState, autoEnterPanoramaEdit } = usePanoramaEdit();
  const { initialModel3DState, delSearchUrl: delSearchUrlModel3D } = useInitialModel3D();

  const ScenesComponent = useMemo(() => {
    switch (caseType) {
      case 'Project':
        return <Scenes />;
      case 'PanoramaData':
        return <VRHouseSideBar />;
      default:
        return null;
    }
  }, [caseType]);

  const ResourceComponent = useMemo(() => {
    if (sceneMode !== 'Product' && !playable) {
      if (typeOfPlay === 4) {
        return <NewResource />;
      }
      if (typeOfPlay === 3 && category === 3) {
        return <VrVideoResource />;
      }
      return <Resource />;
    }
    if (sceneMode === 'Product' && isVRCaseAndInEdit(getState().project) && edit3d) return <Resource />;

    return null;
  }, [getState, playable, sceneMode, typeOfPlay, edit3d]);

  useEffect(() => {
    if (!loading) {
      if (Number(/Chrome\/(\d*)/i.exec(navigator.userAgent)?.[1]) < 79) {
        Modal.info({
          content: '为了更好的使用体验，建议使用最新谷歌Chrome浏览器打开本编辑器。',
          okText: '我知道了',
          onOk: () => {
            setVisibleFlag(false, false);
          },
        });
      } else {
        setVisibleFlag(false);
      }
    }
  }, [loading, setVisibleFlag]);

  // 初始化 3D 资源
  useEffect(() => {
    const initial3D = async () => {
      // 初始化碰撞组
      initialLayer();
    };
    const exe = async () => {
      try {
        onChangeLoading(true);
        const isEmptyVR = getSearchParams().emptyVR === '1';

        // 初始化 VR 看房
        if (isVRCase(getState().project) && getSearchParams().initialVR) {
          await initialPanoramaState();
          delSearchUrl();
        }
        // 初始化 3D 看车
        if (getSearchParams().initialCar) {
          await initialModel3DState();
          delSearchUrlModel3D();
        }

        await initial3D();
        // VRCase 直接进入全景编辑
        if (isVRCase(getState().project)) {
          setTimeout(async () => {
            await autoEnterPanoramaEdit(isEmptyVR);
            onChangeLoading(false);
          }, 100);
        } else {
          onChangeLoading(false);
        }
      } catch (error) {
        onChangeLoading(false);
        Modal.error({
          title: '错误',
          content: `${isVRCase(getState().project) ? 'VR' : '3D'} 项目初始化失败:${error.message}`,
        });
      }
    };
    if (enabled3d && id) exe();
  }, [enabled3d, id, onChangeLoading]);

  useImbot();
  useIdeMessage();
  useResumeGlobalVars();

  const { token } = theme.useToken();
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            colorBgBody: token.colorBgContainer,
          },
        },
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <LayerModal />
        <ResourceModal />
        <Layout className={cx(className, css({ color: token.colorTextBase }))}>
          {visible && caseType === 'Component' && (
            <Alert
              type="info"
              showIcon
              closable
              message="您当前正在编辑组件，保存后该组件会同步到“我的素材”中。点击提交按钮，您可继续编辑作品"
              onClose={() => {
                setVisible(false);
              }}
              action={
                <Checkbox
                  checked={remember}
                  onChange={({ target: { checked } }) => {
                    setRemember(checked);
                  }}
                >
                  不再提醒
                </Checkbox>
              }
            />
          )}
          <LatestNotice />
          <Header />
          <Layout
            onContextMenu={e => {
              e.preventDefault();
            }}
          >
            <Spin size="large" tip="加载中..." spinning={loading} wrapperClassName={spinStyle}>
              <Layout style={{ flexDirection: 'row', overflow: 'hidden', height: '100%' }}>
                {!hideScenes && ScenesComponent}
                {caseType === 'History' && <History />}
                <Layout style={{ overflow: 'hidden' }}>
                  <Layout style={{ flexDirection: 'row', overflow: 'hidden', borderBottom: '1px solid transparent' }}>
                    {!hideResource && ResourceComponent}
                    <ErrorBoundary>{!hidePreviewer ? <Preview /> : <Layout.Content />}</ErrorBoundary>
                    {sceneMode !== 'Product' && !playable && <Toolbar />}
                    <ErrorBoundary>{!hideProperty && <Property />}</ErrorBoundary>
                  </Layout>
                  {!hideElements && sceneMode !== 'Product' && !playable && <Elements />}
                  {sceneMode !== 'Product' && !playable && <ContextMenu />}
                </Layout>
              </Layout>
            </Spin>
          </Layout>
        </Layout>
        <Blueprint />
        <TutorialModal />
      </DndProvider>
    </ConfigProvider>
  );
}
