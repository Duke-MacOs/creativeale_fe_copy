import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Input, Button, Spin, Tooltip, theme, message, Select } from 'antd';
import Icon from '@ant-design/icons';
import { Left, Search, Upload, Help, Clear, DownPicture } from '@icon-park/react';
import { css } from 'emotion';
import { usePersistCallback } from '@byted/hooks';
import { IMaterial } from '@/types/library';
import { Category, GroupList } from '@editor/aStore';
import {
  UploadFiles,
  UploadFrame,
  ImportFigmaDialog,
  ImportPsdDialog,
  UploadCubemaps,
  UploadModel,
} from '../../upload';
import { collectEvent, EventTypes, isSceneResource } from '@editor/utils';
import useAddResourceEntry from '../useAddResourceEntry';
import { useCleanQuickly } from '../useDelResourceEntry';
import useFetchSearchData from './useFetchSearchData';
import CategorySelect from './CategorySelect';
import useCategories from './useCategories';
import useReplacing from '../useReplacing';
import { debounce } from 'lodash';
import useBatchDownload from '../useBatchDownloadEntry';
import { UploadTexture2D } from '@editor/Resource/upload/UploadTexture2D';
import { EffectTypes } from '@editor/Resource/entries/2d/Effect';
import { getResourceName, mapEffectToCid } from '@shared/utils/resource';

const minHeight = { minHeight: 60 };

const manageBarStyle = css({
  padding: '12px 2px 0',
  '& .ant-btn': {
    padding: '4px 10px',
  },
  '& .ant-btn > .anticon + span': {
    marginLeft: '4px',
  },
});

type ArrayItem<C> = C extends Array<{
  category: infer I;
}>
  ? I
  : never;

export default function withTabs<C extends Category | Array<{ category: Category; title: string }>>(
  category: C,
  Component: React.ComponentType<any>
) {
  const categories = (Array.isArray(category) ? category : [{ category, title: category }]) as {
    category: Category;
    title: string;
  }[];
  return ({ defaultCategory }: { defaultCategory?: ArrayItem<C> }) => {
    const { token } = theme.useToken();
    const { dispatch } = useStore();
    const projectId = useSelector(({ project: { id } }: EditorState) => id);
    const teamId = useSelector(({ project: { teamId } }: EditorState) => teamId);
    const { replacing, onReplace, acceptFiles } = useReplacing();
    const { category, provider, projectData, setCategory } = useCategories(
      teamId,
      projectId,
      categories,
      defaultCategory
    );
    const { fetchSearchData, groupData, loadingData, setGroupData } = useFetchSearchData(teamId, projectId, category);
    const [expandedGroup, setExpandedGroup] = useState<GroupList<IMaterial>[number] | null>(null);
    const [keyword, setKeyword] = useState<string | undefined>(undefined);
    const [searching, setSearching] = useState<boolean>(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [figmaImporterVisible, setFigmaImporterVisible] = useState(false);
    const [psdImporterVisible, setPsdImporterVisible] = useState(false);
    const onAddResourceEntry = useAddResourceEntry();
    const onCleanQuickly = useCleanQuickly();
    const onBatchDownload = useBatchDownload();
    const [effectType, setEffectType] = useState<Category>(EffectTypes[0].value);
    const renderUploader = usePersistCallback(
      (
        trigger: (
          tooltip: React.ReactNode,
          trigger: (trigger: React.ReactNode, provider: any) => React.ReactNode
        ) => React.ReactNode
      ) => {
        const tips: Record<string, string> = {
          Sprite: 'jpg/png图片',
          Sound: 'mp3文件',
          Video: 'mp4文件',
          NativeVideo: 'mp4、mov文件',
          NativeLoadingVideo: 'mp4、mov文件',
          Lottie: 'json文件 / Lottie zip包(json+图片)',
          Particle: 'plist文件 / 粒子zip包(plist+图片)',
          FrameAnime: '多个有序的图片文件',
          DragonBones: '龙骨zip包(json+png)',
          Spine: 'Spine zip包(json/skel+png+atlas)',
          Live2d: 'Live2D zip包(json+图片+moc3)',
        };
        const tooltip = (
          <Tooltip placement="bottom" title={tips[category]}>
            <Help
              theme="outline"
              style={{ marginLeft: '3px', lineHeight: '11px', verticalAlign: 'middle' }}
              onClick={e => {
                e.preventDefault();
                window.open('https://bytedance.feishu.cn/docs/doccnxn0Z0wqEMDtzVJnPwa1b9c#');
              }}
            />
          </Tooltip>
        );
        return trigger(tooltip, (trigger, provider) => {
          if (category === 'Effect' && effectType === 'FrameAnime') {
            return (
              <UploadFrame
                uploading={uploading}
                setUploading={setUploading}
                onAddResourceEntry={({ name, id, url: previewUrl, cover, extra }) => {
                  onAddResourceEntry(category, provider, '未分类', {
                    id,
                    previewUrl,
                    name,
                    cover,
                    extra,
                    type: { name: getResourceName(mapEffectToCid[effectType]), cid: mapEffectToCid[effectType] },
                  });
                  replacing && onReplace(id, name, previewUrl, cover);
                }}
              >
                {trigger}
              </UploadFrame>
            );
          }
          if (category === 'Cubemaps') {
            return (
              <UploadCubemaps
                dispatch={dispatch}
                uploading={uploading}
                setUploading={setUploading}
                onAddResourceEntry={({ name, id, url: previewUrl, cover, extra }) => {
                  onAddResourceEntry(category, provider, '未分类', {
                    id,
                    previewUrl,
                    name,
                    cover,
                    extra,
                  });
                  replacing && onReplace(id, name, previewUrl, cover);
                }}
              >
                {trigger}
              </UploadCubemaps>
            );
          }
          if (category === 'Model') {
            return (
              <UploadModel
                onAddResourceEntry={({ name, id, url: previewUrl }) => {
                  onAddResourceEntry(category, provider, '未分类', {
                    id,
                    previewUrl,
                    name,
                  });
                }}
                uploading={uploading}
                setUploading={setUploading}
              >
                {trigger}
              </UploadModel>
            );
          }
          if (category === 'Texture2D') {
            return (
              <UploadTexture2D uploading={uploading} setUploading={setUploading}>
                {trigger}
              </UploadTexture2D>
            );
          }
          return (
            <UploadFiles
              multiple={!replacing}
              uploading={uploading}
              category={category === 'Effect' ? effectType : category}
              acceptFiles={acceptFiles}
              setUploading={setUploading}
              onAddResourceEntry={({ name, id, url: previewUrl, cover, extra }) => {
                onAddResourceEntry(category, provider, '未分类', {
                  id,
                  previewUrl,
                  name,
                  cover,
                  extra,
                  type: { name: getResourceName(mapEffectToCid[effectType]), cid: mapEffectToCid[effectType] },
                });
                replacing && onReplace(id, name, previewUrl);
              }}
            >
              {trigger}
            </UploadFiles>
          );
        });
      }
    );

    const timerOriginResource = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
      if (timerOriginResource.current) {
        clearTimeout(timerOriginResource.current);
      }
      timerOriginResource.current = setTimeout(() => {
        collectEvent(EventTypes.OriginResource, {
          type: provider,
        });
      }, 1000);
    }, [provider]);
    const timerSelectResource = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
      if (timerSelectResource.current) {
        clearTimeout(timerSelectResource.current);
      }
      timerSelectResource.current = setTimeout(() => {
        if (['Animation', 'PSD', 'CustomScript'].includes(category)) {
          // 互动组件、平面组件、脚本组件
          collectEvent(EventTypes.SelectResource, {
            type: 'Animation',
          });
          collectEvent(EventTypes.OriginComponent, {
            type: category,
          });
        } else if (['Lottie', 'Particle', 'FrameAnime', 'DragonBones', 'Spine'].includes(category)) {
          // 动效
          collectEvent(EventTypes.SelectResource, {
            type: 'effect',
          });
          collectEvent(EventTypes.OriginEffect, {
            type: category,
          });
        } else {
          // 图片、视频...
          collectEvent(EventTypes.SelectResource, {
            type: category,
          });
        }
      }, 1000);
    }, [category]);

    const visibleProjectUpload = !['Particle3D', 'Animation', 'Animation3D'].includes(category);
    return (
      <>
        <div
          style={{
            padding: replacing ? '0 12px 4px' : '16px 12px 4px',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            background: token.colorBgContainer,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Input.Search
              allowClear
              loading={loadingData}
              placeholder={`搜索关键词`}
              prefix={
                keyword !== undefined &&
                searching && (
                  <Icon
                    component={Left as any}
                    style={{ cursor: 'pointer' }}
                    title="返回"
                    onClick={() => {
                      setSearching(false);
                      setKeyword(undefined);
                      fetchSearchData(undefined, expandedGroup, null, provider);
                    }}
                  />
                )
              }
              onChange={debounce(e => {
                const value = e.target.value;
                setKeyword(value);
                if (value) {
                  setSearching(true);
                  fetchSearchData(value, expandedGroup, null, provider);
                } else {
                  setSearching(false);
                }
              }, 800)}
              enterButton={loadingData ? undefined : <Button title="搜索" icon={<Icon component={Search as any} />} />}
              onSearch={() => {
                if (keyword !== undefined) {
                  setSearching(true);
                  fetchSearchData(keyword, expandedGroup, null, provider);
                }
              }}
            />
          </div>
        </div>
        {searching || expandedGroup ? (
          <Spin spinning={loadingData && !groupData} style={minHeight}>
            <Component
              groups={groupData ? [groupData] : []}
              setGroupData={setGroupData}
              category={category}
              provider={provider}
              searching
            />
          </Spin>
        ) : (
          <>
            {!defaultCategory && (
              <CategorySelect categories={categories} current={category} setCategory={setCategory} />
            )}
            {
              <div className={manageBarStyle}>
                {visibleProjectUpload &&
                  renderUploader((tooltip, trigger) =>
                    trigger(
                      <Button type="link" icon={<Icon component={Upload as any} />} loading={uploading}>
                        本地上传
                        {tooltip}
                      </Button>,
                      provider
                    )
                  )}
                {category === 'Effect' && (
                  <Select
                    size="small"
                    value={effectType}
                    style={{ width: 100 }}
                    onChange={value => {
                      setEffectType(value);
                    }}
                    options={EffectTypes}
                  />
                )}
                <Tooltip title="一键删除没有用到的素材">
                  <Button
                    type="link"
                    icon={<Icon component={Clear as any} />}
                    onClick={async () => {
                      onCleanQuickly(category, provider);
                    }}
                  >
                    {visibleProjectUpload ? '' : '一键删除'}
                  </Button>
                </Tooltip>
                {category === 'Sprite' && (
                  <Tooltip title="一键下载项目图片">
                    <Button
                      type="link"
                      icon={<Icon component={DownPicture as any} />}
                      loading={downloading}
                      onClick={async () => {
                        try {
                          setDownloading(true);
                          await onBatchDownload(category, provider);
                        } catch (error) {
                          message.error('批量下载失败');
                        } finally {
                          setDownloading(false);
                        }
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            }
            <Spin spinning={isSceneResource(category) ? false : projectData.length === 0} style={minHeight}>
              <Component
                groups={projectData}
                category={category}
                provider={provider}
                setGroupData={setGroupData}
                onExpand={(expanded: typeof expandedGroup) => {
                  setSearching(true);
                  setExpandedGroup(expanded);
                  fetchSearchData(keyword, expanded, null, provider);
                }}
              />
            </Spin>
          </>
        )}
        {figmaImporterVisible && (
          <ImportFigmaDialog
            onFinish={dataList => {
              if (provider === 'private') {
                dataList.forEach(({ id, url: previewUrl, name, cover }) => {
                  onAddResourceEntry(category, provider, '未分类', { id, previewUrl, name, cover });
                });
              }
              setFigmaImporterVisible(false);
            }}
            onHide={() => setFigmaImporterVisible(false)}
          />
        )}
        {psdImporterVisible && (
          <ImportPsdDialog
            onFinish={dataList => {
              if (provider === 'private') {
                dataList.forEach(({ id, url: previewUrl, name, cover }) => {
                  onAddResourceEntry(category, provider, '未分类', { id, previewUrl, name, cover });
                });
              }
              setPsdImporterVisible(false);
            }}
            onHide={() => setPsdImporterVisible(false)}
          />
        )}
      </>
    );
  };
}
