import { PreviewOpen } from '@icon-park/react';
import { Card, Divider, message, Space, Typography } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { IData, ResourceTypeInModal } from '../type';
import { useData, useDetail, useExistData, useModalState, useSelectedList } from '../Context';
import MaterialCover from '@shared/components/MaterialCover';
import React from 'react';
import shallow from 'zustand/shallow';
import { convertRikoPreviewCategory, getResourceMime, getResourceName, isResourceEffect } from '@shared/utils/resource';
import useRequest from '../hooks/useRequest';
import { IframePreview, usePostMessage } from '@editor/Resource/Preview';

type Props = {
  data: IData[];
  onAddSelected?: (data: IData) => void;
  onShowDetail?: (data: IData) => void;
  onIncreasePage: () => void;
};

const getDescription = (data: IData) => {
  switch (data.type.cid) {
    case ResourceTypeInModal.Image:
      return (
        <span style={{ fontSize: '9px' }}>{`${data.extra.width ?? '未知'} x ${data.extra.height ?? '未知'}`}</span>
      );
    default:
      return null;
  }
};

const Tags = ({ items }: { items: { label: string; color: string }[] }) => {
  return (
    <Space direction="vertical" align="end">
      {items.map((item, idx) => (
        <span key={idx} style={{ padding: '5px', borderRadius: '10px', backgroundColor: item.color, fontSize: '11px' }}>
          {item.label}
        </span>
      ))}
    </Space>
  );
};

const Item = React.memo(
  ({
    data,
    isExist,
    onEffectPreviewStart,
    onEffectPreviewEnd,
  }: {
    data: IData;
    isExist: boolean;
    onEffectPreviewStart: (el: Element, data: IData) => void;
    onEffectPreviewEnd: () => void;
  } & Pick<Props, 'onShowDetail' | 'onAddSelected'>) => {
    const coverRef = useRef(null);
    const resourceType = useModalState(state => state.modalState.resourceType, shallow);
    const { updateSelectedList, getSelectedList } = useSelectedList(
      state => ({
        updateSelectedList: state.updateSelectedList,
        getSelectedList: state.getSelectedList,
      }),
      shallow
    );
    const updateDetail = useDetail(state => state.updateDetail, shallow);
    const { addViewCountMaterial } = useRequest();

    const onAddSelected = (data: IData) => {
      if (isExist) {
        message.warning('该资源已添加进项目');
        return;
      }
      if (getSelectedList().length >= 20) {
        message.warning('最多同时添加20个资源');
        return;
      }
      if (getSelectedList().some(i => i.id === data.id)) {
        message.warning('无法重复添加资源');
        return;
      }
      updateSelectedList([...getSelectedList(), data]);
    };
    const onShowDetail = (data: IData) => {
      console.log('show detail:', data);
      addViewCountMaterial(data.id);
      updateDetail(data);
    };

    const tags = [];
    // 特效才显示二级名称
    if (resourceType === ResourceTypeInModal.Effect)
      tags.push({ label: getResourceName(data.type.cid), color: '#fbe0c3' });
    if (isExist) tags.push({ label: '已添加', color: '#ffbb98' });

    return (
      <Card
        key={data.id}
        size="small"
        style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden' }}
        onMouseEnter={e => {
          resourceType === ResourceTypeInModal.Effect && onEffectPreviewStart(e.currentTarget, data);
        }}
        onMouseLeave={onEffectPreviewEnd}
        cover={
          <div
            ref={coverRef}
            style={{ cursor: 'pointer', borderRadius: '20px', width: '180px', height: '180px' }}
            onClick={() => {
              onAddSelected(data);
            }}
          >
            <MaterialCover data={data} CoverBoxRef={coverRef} />
            <div style={{ position: 'absolute', top: '0', right: '0', zIndex: 10 }}>
              <Tags items={tags} />
            </div>
          </div>
        }
      >
        <Card.Meta
          title={
            <Typography.Text ellipsis style={{ width: '130px', fontSize: '14px' }}>
              {data.name}
            </Typography.Text>
          }
          description={getDescription(data)}
        />
        <PreviewOpen
          style={{ position: 'absolute', bottom: '4px', right: '15px', cursor: 'pointer' }}
          onClick={() => {
            onShowDetail(data);
          }}
          theme="outline"
          size="20"
          fill="#f5a623"
        />
      </Card>
    );
  }
);

export default React.memo(({ showBottomLine }: { showBottomLine: boolean }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const data = useData(state => state.data, shallow);
  const existData = useExistData(state => state.data, shallow);
  const { clearIframe, postMessage } = usePostMessage(iframeRef);
  const [effectPreview, setEffectPreview] = useState<{
    left: number;
    top: number;
    visible: boolean;
  }>({
    left: 0,
    top: 0,
    visible: false,
  });

  const isExist = (data: IData) => {
    return existData.some(i => data.url.endsWith(i.url) || data.previewUrl.endsWith(i.url));
  };

  const onEffectPreviewStart = useCallback((target: any, data: IData) => {
    const { offsetLeft: left, offsetTop: top } = target;
    setEffectPreview({
      left,
      top,
      visible: true,
    });

    if (iframeRef.current) {
      postMessage({
        type: 'change',
        url: data.previewUrl,
        projectType: convertRikoPreviewCategory(getResourceMime(data.type.cid)),
        loop: true,
      });
    }
  }, []);

  const onEffectPreviewEnd = useCallback(() => {
    if (effectPreview.visible) {
      setEffectPreview(prev => ({ ...prev, visible: false }));
      clearIframe();
    }
  }, [effectPreview]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '24px 0',
      }}
    >
      <Space style={{ position: 'relative' }} wrap size="large" align="center">
        {data.map(i => (
          <Item
            key={i.id}
            data={i}
            isExist={isExist(i)}
            onEffectPreviewEnd={onEffectPreviewEnd}
            onEffectPreviewStart={onEffectPreviewStart}
          />
        ))}
        <div
          style={{
            left: `${effectPreview.left}px`,
            top: `${effectPreview.top}px`,
            borderRadius: '20px 20px 0 0',
            position: 'absolute',
            zIndex: 9,
            visibility: effectPreview.visible ? 'visible' : 'hidden',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          onMouseLeave={onEffectPreviewEnd}
        >
          <IframePreview ref={iframeRef} width={180} height={180} />
        </div>
      </Space>
      {showBottomLine && <Divider plain>我是有底线的</Divider>}
    </div>
  );
});
