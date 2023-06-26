/**
 * 材质
 *  - 远程材质
 *  - 场景化材质
 *  - 内置材质
 *    - 通用材质
 *    - 拖尾材质（重置时，不能设置为空）
 */
import { createScene } from '@shared/api/project';
import { absoluteUrl } from '@shared/utils';
import { DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { captureMaterial } from '@byted/riko';
import { addMaterial, IMaterialState, updateMaterial, useProject, changeProps } from '@editor/aStore';
import { CellContext, getIndexer } from '@editor/Editor/Property/cells';
import { MaterialTwo } from '@icon-park/react';
import { Cascader, Button, Tooltip, Modal, Input } from 'antd';
import { FC, useContext, useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { SparkFn, SparkType } from '../..';
import * as content from './spark';
import Axios from 'axios';
import { getImageData, getUseMaterialNodes } from '@editor/utils';
import useMaterial from './hooks/useMaterial';
import useTexture2D from './hooks/useTexture2D';
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export const createOriginMaterial: any = async (
  material: any,
  projectId: number,
  url: string | number,
  name?: string
) => {
  if (name) material.props.name = name;
  const { id, orderId } = await createScene({
    projectId: projectId,
    name: 'material',
    sceneContent: JSON.stringify({
      type: 'Material',
      material: {
        value: material,
      },
      _originUrl: typeof url === 'string' ? url : '',
    }),
  });
  return {
    id,
    orderId,
    name: 'material',
    type: 'Material',
    isCustom: true,
    cover: '',
    _originUrl: typeof url === 'string' ? url : undefined,
    originOrderId: typeof url === 'string' ? undefined : url,
    material,
  };
};

interface IProps {
  type: SparkType | '';
  orderId: number | string;
  copyLoading: boolean;
  editable?: boolean;
  onCopy?: () => void;
  onDelete?: (id: number) => void;
  onChange: (id: number) => void;
}

const MatSelectItem = ({ item, orderId, url }: any) => {
  const [cover, setCover] = useState(item?.cover ?? '');
  useEffect(() => {
    if (item && (orderId || url)) {
      captureMaterial(orderId ?? url, 24, 24, 0.1)
        .then(data => {
          setCover(data);
        })
        .catch(e => {
          console.log('captureMaterial Error:', e);
        });
    } else {
      setCover('');
    }
  }, [item, orderId, url]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      {cover ? (
        <img src={cover} style={{ width: '24px', height: '24px', marginRight: '10px' }} />
      ) : (
        <MaterialTwo
          theme="outline"
          style={{ width: '24px', height: '24px', marginRight: '10px' }}
          size="24"
          fill="#333"
        />
      )}

      {item?.name ?? '默认材质'}
    </div>
  );
};

const withHoverDelete =
  (Component: FC) =>
  ({ onDelete, ...props }: any) => {
    const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
    return (
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        onMouseLeave={() => {
          setVisibleDelete(false);
        }}
        onMouseEnter={() => {
          setVisibleDelete(true);
        }}
      >
        <Component {...(props as any)} />
        {onDelete && visibleDelete && (
          <DeleteOutlined
            style={{ justifySelf: 'end' }}
            onClick={(e: any) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        )}
      </div>
    );
  };

const MatItem = withHoverDelete(MatSelectItem);

/**
 * 下拉选项菜单
 */
export const MaterialSelect = ({ type, orderId, copyLoading, onCopy, onChange, onDelete, editable = true }: IProps) => {
  const { dispatch } = useStore<EditorState, EditorAction>();
  const { readOnly } = useProject('editor');
  const projectId = useProject('id');
  const materials = useSelector(({ project }: EditorState) => {
    return project.materials;
  });
  const [originMaterial, setOriginMaterial] = useState<any>();
  const { addTexture2D } = useTexture2D();
  const { getPresetMaterialInfo, createMaterial } = useMaterial();
  useEffect(() => {
    if (typeof orderId === 'string' && orderId !== '') {
      Axios.get(absoluteUrl(orderId)).then(({ data }) => {
        setOriginMaterial(data);
      });
    } else {
      setOriginMaterial(undefined);
    }
  }, [orderId]);

  const material = materials.find(i => i.orderId === orderId);

  const filterTrailMaterial = (i: IMaterialState) => {
    if (!type) return true;
    if (i?.material === undefined) return false;
    return type === 'Trail3D' ? i?.material?.type === 'TrailMaterial' : i?.material?.type !== 'TrailMaterial';
  };

  const filterSkyboxMaterial = (i: IMaterialState) => {
    if (!type) return true;
    if (i?.material === undefined) return false;
    return i?.material?.type !== 'Skybox6SidedMaterial';
  };

  const mineMaterials = materials
    .filter(i => i.isCustom === true)
    .filter(filterTrailMaterial)
    .filter(filterSkyboxMaterial);

  const {
    visiting: { prev = [], onVisit },
  } = useContext(CellContext);

  const options = [
    {
      value: 'preset',
      label: '新建材质',
      children: getPresetMaterialInfo(type as any).map(item => {
        return {
          value: { name: item?.name, type: item?.type },
          label: <MatSelectItem key={item.type} item={item} />,
        };
      }),
    },
    ...mineMaterials.map(item => ({
      value: item.orderId,
      label: (
        <MatItem
          key={item.orderId}
          item={item?.material?.props}
          orderId={item?.orderId}
          {...(onDelete
            ? {
                onDelete: () => {
                  onDelete?.(item.id);
                },
              }
            : {})}
        />
      ),
    })),
  ];

  const onEdit = async () => {
    if (typeof orderId === 'string') {
      let texture2D;
      for (let i = 0, entries = Object.entries(originMaterial.props); i < entries.length; i++) {
        const [key, val] = entries[i];
        if (key.endsWith('Url') && typeof val === 'string') {
          texture2D = await addTexture2D(val);
          originMaterial.props[key] = texture2D.orderId;
        }
      }

      // 场景化远程材质
      const newMaterial = await createOriginMaterial(originMaterial, projectId, orderId);
      dispatch(addMaterial(newMaterial as any));
      onChange(newMaterial?.orderId);
      onVisit(prev.map(({ index }) => index).concat(newMaterial?.id));
    } else {
      // 编辑场景化材质
      material && onVisit(prev.map(({ index }) => index).concat(material?.id));
    }
  };

  const isValidOriginUrl = typeof orderId === 'string' && orderId !== '';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Cascader
        style={{ width: '100%', marginRight: '20px' }}
        dropdownMenuColumnStyle={{ width: '180px' }}
        value={[orderId]}
        options={options}
        disabled={readOnly}
        onChange={async (value: any[]) => {
          const isUsePreset = value.length === 2;

          if (isUsePreset) {
            const { orderId } = await createMaterial(value[1].name, value[1].type);
            onChange(orderId);
          } else {
            const orderId = value[0];
            onChange(orderId);
          }
        }}
        placeholder="请选择材质"
      >
        <div
          style={{ flex: '1', border: '1px solid #f0f0f0', borderRadius: '5px', padding: '3px', marginRight: '20px' }}
        >
          <MatSelectItem
            item={typeof orderId === 'string' ? originMaterial?.props : material?.material?.props}
            orderId={orderId}
          />
        </div>
      </Cascader>
      {editable && (
        <Tooltip title={readOnly ? '只读模式不可编辑' : material === undefined ? '默认材质不可编辑' : '编辑材质'}>
          <Button
            style={{ marginRight: '5px' }}
            onClick={onEdit}
            disabled={!(material !== undefined || isValidOriginUrl) || readOnly}
          >
            <EditOutlined />
          </Button>
        </Tooltip>
      )}
      {onCopy && (
        <Tooltip title={readOnly ? '只读模式不可复制' : material === undefined ? '默认材质不可复制' : '复制材质'}>
          <Button disabled={readOnly || !material} loading={copyLoading} onClick={onCopy}>
            <CopyOutlined />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

const CopyMaterialModal = ({ name, onChange }: { name: string; onChange: (name: string) => void }) => {
  const [copyName, setCopyName] = useState(name);

  return (
    <Input
      placeholder="材质命名"
      value={copyName}
      onChange={e => {
        setCopyName(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
};

export const materialsGroup: SparkFn = props => {
  return {
    spark: 'block',
    status: 'static',
    content: {
      spark: 'value',
      index: 'materialUrls',
      visit: true,
      content(urls = [], onChange) {
        const {
          visiting: { next = [] },
        } = useContext(CellContext);
        const { dispatch, getState } = useStore<EditorState, EditorAction>();
        const { deleteMaterial } = useMaterial();
        const [copyLoading, setCopyLoading] = useState(false);

        if (next.length >= 1) {
          const material = getState().project.materials.find(({ id }) => id === next[0]);
          if (material) {
            return {
              spark: 'context',
              content: {
                spark: 'visit',
                index: material.id,
                label: `${material?.material?.props?.name}` ?? 'material',
                content: content[material?.material.type as keyof typeof content],
              },
              provide() {
                return {
                  useValue(index, isEqual) {
                    const { indexValue, indexEntries } = getIndexer(index);

                    const value = useSelector(({ project: { materials } }: EditorState) => {
                      const target = materials.find(({ id }) => id === next[0])!;
                      const { material } = target;
                      return [indexValue(material.props)];
                    }, isEqual);
                    return {
                      value,
                      onChange: async ([value]) => {
                        const keys = Object.keys(value);
                        // 如果是修改的图片 url
                        // 则获取图片宽高并更改
                        if (keys.includes('url')) {
                          const data =
                            value.url === ''
                              ? {
                                  width: 0,
                                  height: 0,
                                  isAlpha: 0,
                                }
                              : await getImageData(value.url);
                          value.width = data.width;
                          value.height = data.height;
                          value.format = data.isAlpha ? 1 : 0;
                        }

                        const self = getState().project.materials.find(({ id }) => id === next[0])!;
                        if (self) {
                          dispatch(
                            updateMaterial(self.id, {
                              ...self.material,
                              props: { ...self.material.props, ...Object.fromEntries(indexEntries(value)) },
                            })
                          );
                          onChange([...urls]);

                          // 找到所有用到这个材质的节点，并更新
                          const list = getUseMaterialNodes(getState().project, self.orderId);
                          list.forEach(({ id, materialUrls }) => {
                            dispatch(
                              changeProps([id], {
                                materialUrls: [...materialUrls],
                              })
                            );
                          });
                        }
                      },
                    };
                  },
                };
              },
            };
          }
        }

        return {
          spark: 'group',
          label: '材质',
          content: {
            spark: 'grid',
            content: urls.map((orderId: number | string, idx: number) => {
              const getOnChange = () => {
                return (id: number) => {
                  const newUrls = urls.slice();
                  newUrls[idx] = id;
                  onChange(newUrls);
                };
              };
              const onCopy = async () => {
                setCopyLoading(true);
                const originData = typeof orderId === 'string' ? await Axios.get(absoluteUrl(orderId)) : null;
                const material = originData
                  ? originData.data
                  : getState().project.materials.find(({ orderId: itemOrderId }) => itemOrderId === orderId)?.material;
                let curName = material.props.name;

                if (material) {
                  Modal.confirm({
                    title: '复制材质',
                    content: (
                      <CopyMaterialModal
                        name={curName}
                        onChange={name => {
                          curName = name;
                        }}
                      />
                    ),
                    cancelText: '取消',
                    onOk: async () => {
                      const newMaterial = await createOriginMaterial(
                        cloneDeep(material),
                        getState().project.id,
                        orderId,
                        curName
                      );
                      dispatch(addMaterial(newMaterial as any));
                      setCopyLoading(false);
                    },
                    onCancel: () => {
                      setCopyLoading(false);
                    },
                  });
                } else {
                  message.error('没有找到材质');
                  setCopyLoading(false);
                }
              };
              const getOnDelete = () => (id: number) => {
                const deleteOrderId = deleteMaterial(id);
                if (deleteOrderId) {
                  const newUrls = urls.slice();
                  newUrls[newUrls.indexOf(deleteOrderId)] = '';
                  onChange(newUrls);
                }
              };

              return {
                spark: 'element',
                content() {
                  return (
                    <MaterialSelect
                      type={props.type}
                      orderId={orderId}
                      copyLoading={copyLoading}
                      onCopy={onCopy}
                      onDelete={getOnDelete()}
                      onChange={getOnChange()}
                    />
                  );
                },
              };
            }),
          },
        };
      },
    },
  };
};
