import { CloseSmall } from '@icon-park/react';
import {
  getResourceMime,
  getResourceName,
  getResourceNodeType,
  isNormalResource,
  isResource3D,
  isSceneResource,
} from '@shared/utils/resource';
import { Button, Space, Divider, Typography, Checkbox, message, Image, Tooltip } from 'antd';
import { useDetail, useImportState, useSelectedList } from '../Context';
import useUpload from '../hooks/useUpload';
import { IAIData, IData } from '../type';
import defaultImage from '@shared/assets/images/default_image.png';
import shallow from 'zustand/shallow';
import React, { useRef, useState } from 'react';
import { INodeState, ISceneState, useAddNode, useAddNodeWith3D } from '@editor/aStore';
import { useSelector } from 'react-redux';
import { resourceModalController } from '..';
import MaterialCover from '@shared/components/MaterialCover';
import useRequest from '../hooks/useRequest';

type Props = {
  list: IData[];
  onDeleteSelected: (ids: string[]) => void;
  onUploadAssets: () => void;
};

const Item = ({ data, onDeleteSelected }: { data: IData } & Pick<Props, 'onDeleteSelected'>) => {
  const coverRef = useRef<HTMLDivElement>(null);
  const updateDetail = useDetail(state => state.updateDetail, shallow);
  const onShowDetail = () => {
    updateDetail(data);
  };
  return (
    <div
      key={data.id}
      style={{ position: 'relative', borderRadius: '10px', backgroundColor: '#FFF1E9', padding: '10px' }}
    >
      <CloseSmall
        theme="outline"
        size="20"
        fill="#f5a623"
        style={{ position: 'absolute', top: '-10px', right: '-10px', color: 'red', cursor: 'pointer' }}
        onClick={() => {
          onDeleteSelected([data.id]);
        }}
      />
      <Space direction="vertical">
        <Tooltip title={data.name}>
          <div style={{ width: '50px', height: '50px', cursor: 'pointer' }} onClick={onShowDetail}>
            <MaterialCover ref={coverRef} data={data} CoverBoxRef={coverRef} playIcon={null} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              padding: '0 8px',
              borderRadius: '4px 0 4px 0',
              backgroundColor: 'rgba(57, 85, 246,.8)',
              lineHeight: '20px',
              fontSize: '12px',
              color: '#fff',
            }}
          >
            {getResourceName(data.type.cid)}
          </div>
        </Tooltip>
      </Space>
    </div>
  );
};

const AIItem = ({ data, onDeleteSelected }: { data: IAIData; onDeleteSelected: (url: string) => void }) => {
  return (
    <div
      key={data.url}
      style={{ position: 'relative', borderRadius: '10px', backgroundColor: '#FFF1E9', padding: '10px' }}
    >
      <CloseSmall
        theme="outline"
        size="20"
        fill="#f5a623"
        style={{ position: 'absolute', top: '-10px', right: '-10px', color: 'red', cursor: 'pointer' }}
        onClick={() => {
          onDeleteSelected(data.url);
        }}
      />
      <Space direction="vertical">
        <div style={{ width: '50px', height: '50px', cursor: 'pointer' }}>
          <Image style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={data.url} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            padding: '0 8px',
            borderRadius: '4px 0 4px 0',
            backgroundColor: 'rgba(57, 85, 246,.8)',
            lineHeight: '20px',
            fontSize: '12px',
            color: '#fff',
          }}
        >
          AI生成
        </div>
      </Space>
    </div>
  );
};

export default React.memo(() => {
  const [addIntoScene, setAddIntoScene] = useState(true);
  const [loading, setLoading] = useState(false);
  const enabled3d = useSelector((state: EditorState) => state.project.settings.enabled3d);
  const {
    selectedList: list,
    selectedAIList: AIList,
    getSelectedList,
    getSelectedAIList,
    updateSelectedList,
    updateSelectedAIList,
  } = useSelectedList(
    state => ({
      selectedList: state.selectedList,
      selectedAIList: state.selectedAIList,
      getSelectedList: state.getSelectedList,
      getSelectedAIList: state.getSelectedAIList,
      updateSelectedList: state.updateSelectedList,
      updateSelectedAIList: state.updateSelectedAIList,
    }),
    shallow
  );
  const { uploadNormalMaterial, uploadSceneMaterial, uploadAIImage } = useUpload();
  const onAddNode = useAddNode();
  const onAddNodeWith3D = useAddNodeWith3D();
  const {
    updateImportState,
    finishOne,
    errorOne,
    start: onStart,
    resetState: onReset,
    getState,
    onFinish,
  } = useImportState();
  const { addUsedCountMaterial } = useRequest();

  const onDeleteSelected = (ids: string[]) => {
    updateSelectedList(getSelectedList().filter(i => !ids.includes(i.id)));
  };

  const onDeleteSelectedAI = (url: string) => {
    updateSelectedAIList(getSelectedAIList().filter(i => i.url !== url));
  };

  const onClearSelected = () => {
    updateSelectedList([]);
  };

  const onProgress = <T extends Promise<any>>(promise: T, onPromise: () => void, error: string): T => {
    promise
      .then(res => {
        console.log('res:', res);
        onPromise();
      })
      .catch(e => {
        console.log(e.message);
        errorOne(`${error}：${e.message || e.msg || '未知原因'}`);
      });

    return promise;
  };

  const onUploadAssets = async () => {
    setLoading(true);
    const normalMaterial = list.filter(i => isNormalResource(i.type.cid));
    const sceneMaterial = list.filter(i => isSceneResource(i.type.cid));
    onStart({
      desc: '开始上传',
      finish: 0,
      total: normalMaterial.length + sceneMaterial.length + AIList.length,
    });
    console.log('sceneMaterial:', sceneMaterial);
    try {
      // 普通资源添加到项目
      const res1 = await Promise.all(
        normalMaterial.map(i =>
          onProgress(
            uploadNormalMaterial([i.id]),
            () => {
              finishOne();
              addUsedCountMaterial(i.id);
              onDeleteSelected([i.id]);
            },
            `${i.name}导入失败`
          )
        )
      );

      // 资源场景化时，需要创建 orderId，因此这里需要串行执行，并行执行 orderId 会重复
      const res2 = [];
      for (let i = 0; i < sceneMaterial.length; i++) {
        const item = sceneMaterial[i];
        const res = await onProgress(
          uploadSceneMaterial([{ url: item.previewUrl, cover: item.cover, name: item.name }]),
          () => {
            finishOne();
            addUsedCountMaterial(item.id);
            onDeleteSelected([item.id]);
          },
          `${item.name}导入失败`
        );
        res2.push(res);
      }

      // 上传 AI 生成图片
      const res3 = await Promise.all(
        AIList.map(i =>
          onProgress(
            uploadAIImage(i.file),
            () => {
              finishOne();
              onDeleteSelectedAI(i.url);
            },
            `AI 图片导入失败`
          )
        )
      );

      if (addIntoScene) {
        updateImportState({ desc: '正在将资源添加进场景...' });
        // 普通资源添加到场景
        const success1 = res1.reduce((prev, cur) => [...prev, ...cur.success], []);
        await Promise.all(
          success1.map((i: any) =>
            onProgress(
              onAddNodeIntoScene({ mime: getResourceNodeType(i.type), name: i.name, url: i.previewUrl }),
              () => {
                console.log('添加节点成功');
              },
              `${i.name}添加到场景失败`
            )
          )
        );

        // 场景化资源添加到场景
        const success2 = res2.reduce((prev, cur) => [...prev, ...cur.success], []);
        await Promise.all(
          success2.map((i: any) =>
            onProgress(
              onAddNodeIntoScene({ mime: i.type, name: i.name, url: i.orderId }),
              () => {
                console.log('添加节点成功');
              },
              `${i.name}添加到场景失败`
            )
          )
        );

        // AI 图片添加进场景
        await Promise.all(
          res3.map((i: any) =>
            onProgress(
              onAddNodeIntoScene({ mime: 'Sprite', name: i.name, url: i.url }),
              () => {
                console.log('添加节点成功');
              },
              `${i.name}添加到场景失败`
            )
          )
        );
      }

      const result = getState();

      if (result.error.length === 0) {
        message.success('资源全部添加成功');
        updateSelectedList([]);
        onReset();
        resourceModalController.hideModal();
      } else {
        onFinish();
      }
    } catch (error) {
      errorOne('资源异常，剩余资源操作均已终止');
      onFinish();
    } finally {
      setLoading(false);
    }
  };

  const onAddNodeIntoScene = async (data: { mime: string; name: string; url: string | number }) => {
    return await onAddNodeWith3D(data.mime, async () => {
      return await onAddNode(
        {
          mime: data.mime,
          name: data.name,
          url: data.url,
          edit3d: enabled3d && isResource3D({ mime: data.mime }),
        },
        true
      );
    });
  };

  return [...list, ...AIList].length === 0 ? null : (
    <div style={{ borderTop: '1px solid #f0f0f0', width: '100%', bottom: '0' }}>
      <Space style={{ width: '100%', padding: '12px', overflowX: 'scroll' }}>
        {list.map(i => (
          <Item key={i.id} data={i} onDeleteSelected={onDeleteSelected} />
        ))}
        {AIList.map(i => (
          <AIItem key={i.url} data={i} onDeleteSelected={onDeleteSelectedAI} />
        ))}
      </Space>
      <Divider style={{ margin: '0' }} />
      <div style={{ display: 'flex', justifyContent: 'right' }}>
        <Space style={{ padding: '12px' }}>
          <Checkbox
            checked={addIntoScene}
            onChange={e => {
              setAddIntoScene(e.target.checked);
            }}
          >
            同时添加进场景
          </Checkbox>
          <Button style={{ position: 'relative' }} loading={loading} onClick={onUploadAssets}>
            确认添加
            {[...list, ...AIList].length !== 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-7px',
                  width: '22px',
                  borderRadius: '22px',
                  fontSize: '11px',
                  color: 'white',
                  backgroundColor: 'red',
                }}
              >
                {[...list, ...AIList].length}
              </span>
            )}
          </Button>
          <Button disabled={loading} onClick={onClearSelected}>
            清除
          </Button>
        </Space>
      </div>
    </div>
  );
});
