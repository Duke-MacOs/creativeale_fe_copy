import React, { useRef, useState } from 'react';
import { Modal, Tabs, Input, Button, Spin } from 'antd';
import { Play } from '@icon-park/react';
import { css } from 'emotion';
import { EditFilled } from '@ant-design/icons';
import { IMaterial } from '@/types/library';
import { createUseHistory } from '@shared/api/library';
import { IframePreview, usePostMessage } from '@editor/Resource/Preview';
import PublicScenes from './PublicScenes';
import RecentScenes from './RecentScenes';
import '../style.scss';
import { collectEvent, EventTypes } from '@editor/utils';

const { TabPane } = Tabs;

const styled = {
  btn: css({
    display: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }),
  desc: css({
    padding: '12px 9px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  mask: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'none',
  }),
};

export const styles = {
  selectedType: css({
    background: '#EEF3FE',
    color: '#3955F6!important',
  }),
  scenesSection: css({
    display: 'flex',
    flexWrap: 'wrap',
  }),
  sceneItem: css({
    width: 200,
    margin: '0 18px 18px 0',
    border: '1px solid #EEEEEE',
    borderRadius: '4px',
    cursor: 'pointer',
    [`&:hover .${styled.mask}`]: {
      display: 'block',
    },
    [`&:hover .${styled.btn}`]: {
      display: 'block',
    },
    [`&:hover .${styled.desc}`]: {
      display: 'none',
    },
    '.ant-btn': {
      padding: '4px 46px',
    },
  }),
  scenePreview: css({
    height: 356,
    borderRadius: '4px 4px 0 0',
    position: 'relative',
  }),
  sceneFooter: css({
    position: 'relative',
    height: 44,
  }),
};

export enum ActiveKey {
  Public = '1',
  Recent = '2',
}

interface ISceneModalType {
  visible: boolean;
  loading: boolean;
  onFinish: () => void;
  title?: string;
}
export default function SceneModal({ visible, loading, onFinish, title = '选择模板场景' }: ISceneModalType) {
  const [value, setValue] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeKey, setActiveKey] = useState('1');
  const handleValueChange = (e: React.FormEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    if (!e.currentTarget.value) {
      setSearch('');
    }
  };
  const handleSearch = () => {
    collectEvent(EventTypes.SceneLibrary, {
      type: '场景搜索',
      value,
    });
    setSearch(value);
  };
  const handleBlur = () => {
    if (!value) {
      setSearch('');
    }
  };

  const handleToggleTab = (activeKey: string) => {
    setActiveKey(activeKey);
    setValue('');
    setSearch('');
    collectEvent(EventTypes.SceneLibrary, {
      type: activeKey === '1' ? '点击公共场景' : '点击最近使用',
    });
  };

  const afterClose = () => {
    setActiveKey('1');
    setValue('');
    setSearch('');
  };

  return (
    <Modal
      className="sceneModal"
      open={visible}
      onCancel={() => onFinish()}
      footer={null}
      width={1160}
      destroyOnClose
      afterClose={afterClose}
      title={
        <Spin spinning={loading}>
          <div style={{ padding: '16px 24px' }}>{title}</div>
          <div style={{ position: 'relative' }}>
            <Tabs
              centered
              defaultActiveKey="1"
              tabBarExtraContent={
                <div style={{ position: 'absolute', right: 24, top: 7 }}>
                  <Input.Search
                    placeholder="请输入"
                    allowClear
                    value={value}
                    onChange={handleValueChange}
                    onSearch={handleSearch}
                    onBlur={handleBlur}
                  />
                </div>
              }
              onChange={handleToggleTab}
            >
              <TabPane key={ActiveKey.Public} tab="公共场景">
                <PublicScenes activeKey={activeKey} open={visible} search={search} onFinish={onFinish} />
              </TabPane>
              <TabPane key={ActiveKey.Recent} tab="最近使用">
                <RecentScenes activeKey={activeKey} open={visible} search={search} onFinish={onFinish} />
              </TabPane>
            </Tabs>
          </div>
        </Spin>
      }
    />
  );
}

export function ScenesSection({
  scenesList,
  title,
  onFinish,
}: {
  title?: string;
  scenesList: IMaterial[];
  onFinish: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clearIframe, postMessage } = usePostMessage(iframeRef);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [visible, setVisible] = useState(false);
  const handlePreviewStart = (left: number, top: number, url: string) => {
    setLeft(left);
    setTop(top);
    setVisible(true);
    if (iframeRef.current) {
      postMessage({
        type: 'change',
        url,
        projectType: 'scene',
      });
    }
  };

  const handlePreviewEnd = () => {
    setVisible(false);
    clearIframe();
  };

  return (
    <section style={{ position: 'relative' }}>
      {title && (
        <div style={{ fontSize: 16, marginBottom: 17 }} id={title}>
          {title}
        </div>
      )}
      <div className={styles.scenesSection}>
        {scenesList &&
          scenesList.map((scene, index) => (
            <SceneItem key={index} scene={scene} onFinish={onFinish} onPreviewStart={handlePreviewStart} />
          ))}
      </div>
      <div
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: 198,
          height: 356,
          position: 'absolute',
          zIndex: 1000,
          visibility: visible ? 'visible' : 'hidden',
        }}
        onMouseLeave={handlePreviewEnd}
      >
        <IframePreview ref={iframeRef} width={198} height={356} />
      </div>
    </section>
  );
}

function SceneItem({
  scene,
  onFinish,
  onPreviewStart,
}: {
  scene?: any;
  onFinish: (scene?: any) => void;
  onPreviewStart: (left: number, top: number, url: string) => void;
}) {
  const { name, cover, url } = scene;
  const onAddTemplateScene = () => {
    collectEvent(EventTypes.SceneLibrary, {
      type: '使用模板场景',
    });
    onFinish(scene);
    createUseHistory(scene.id).catch(e => console.log(e));
  };

  return (
    <div className={styles.sceneItem}>
      <div
        className={styles.scenePreview}
        onClick={e => {
          const { offsetLeft: left, offsetTop: top } = e.currentTarget;
          onPreviewStart(left, top, url);
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${cover})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            cursor: 'pointer',
          }}
        >
          <div className={styled.mask}>
            <div style={{ opacity: 0.7 }}>
              <Play theme="filled" size="50" fill="#333" />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.sceneFooter}>
        <Button className={styled.btn} type="primary" icon={<EditFilled />} onClick={onAddTemplateScene}>
          立即使用
        </Button>
        <div className={styled.desc}>{name || '未命名场景'}</div>
      </div>
    </div>
  );
}
