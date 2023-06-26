import { postProject } from '@shared/api/project';
import { fetchTemplates, previewTemplate, useTemplate } from '@shared/api/template';
import { amIHere, gotoEditor } from '@shared/utils';
import Icon, { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Previewer } from '@editor/Editor/Header';
import { useUploadVRAsset } from '@editor/Template/Panorama/hooks';
import { dbServer } from '@editor/Template/Panorama/utils';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { Alarm, Book, Delete, CheckOne } from '@icon-park/react';
import { Button, Form, Input, message, Modal, Radio, RadioChangeEvent, Upload } from 'antd';
import JSZip from 'jszip';
import { useState, useEffect, useCallback } from 'react';
import { listProject } from '../api/listProject';

const { Item } = Form;

const VRHOUSE_TEMPLATE_SEARCH_PARAMS = {
  page: 1,
  pageSize: 50,
  status: '30', // 已通过
  tagId: 401009, // VR 看房
  industry: String(1 << 12),
  typeOfPlay: 3,
};

const typeOptions = [
  { label: '2:1', value: 0 },
  { label: '6面体', value: 1 },
  { label: '幸福里', value: 2 },
];

const accept: Record<number, string> = {
  0: 'image/*',
  1: '.zip',
  2: '.json,.zip',
};

export default ({ visible, onCancel }: { visible: boolean; onCancel: () => void }) => {
  const [hoverTemplate, setHoverTemplate] = useState(0);
  const [detail, setDetail] = useState<any>();
  const { uploadXingfuliAsset } = useUploadVRAsset();
  const [templateList, setTemplateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<{
    assetType: number;
    templateId: number;
    xingfuliUrl: string;
    imgId: number;
    fileName: string[];
    file: File | undefined;
  }>({
    assetType: 2,
    templateId: 0,
    xingfuliUrl: '',
    imgId: 0,
    fileName: [],
    file: undefined,
  });
  const [form] = Form.useForm<{
    name: string;
  }>();

  const settingVRHouse = useCallback(
    (urlQuery = {}) => {
      if (config.xingfuliUrl && config.assetType === 2) {
        const id = Math.random();
        window.localStorage.setItem(`vrhouse_${id}`, config.xingfuliUrl);
        urlQuery.vrhouse = id.toString();
      } else if (config.imgId) {
        urlQuery.imgId = config.imgId;
      }
      if (config.templateId === 0) {
        urlQuery.emptyVR = '1';
      }
      urlQuery.assetType = config.assetType;
      urlQuery.initialVR = '1';
      return urlQuery;
    },
    [config]
  );

  useEffect(() => {
    const fetchVRHouseTemplate = async () => {
      const data: any = amIHere({ online: true })
        ? await listProject(VRHOUSE_TEMPLATE_SEARCH_PARAMS)
        : await fetchTemplates(VRHOUSE_TEMPLATE_SEARCH_PARAMS as any);
      setTemplateList(data.list);
    };
    visible && fetchVRHouseTemplate();
  }, [visible]);

  const validForm = async () => {
    const { assetType } = config;
    if (assetType === 1 && config.file) {
      // 校验6面体名字
      const zip = new JSZip();
      const data = await zip.loadAsync(config.file);
      const check = ['0', '1', '2', '3', '4', '5'];
      for (const [key, value] of Object.entries(data.files)) {
        if (key.startsWith('__MACOSX')) continue;
        if (key.endsWith('.DS_Store')) continue;
        if (value.dir) continue;
        // eg: xxx/0.png
        const name = value.name?.split('/').pop()?.split('.').shift() ?? 'noneName';
        const idx = check.indexOf(name);
        if (idx !== -1) check.splice(idx, 1);
      }
      if (check.length !== 0) throw new Error('六面体资源错误');
    }
  };

  const onPreview = async (data: any) => {
    const { id } = data;
    try {
      const { previewUrl } = await previewTemplate(id);
      const url = new URL(previewUrl);
      url.searchParams.set('recorder', 'true');
      setDetail({ url: url.href, typeOfPlay: 5 });
    } catch (err) {
      message.error('无法生成预览链接');
    }
  };

  return (
    <>
      {detail && (
        <Previewer httpUrl={detail.url} typeOfPlay={5} originSize={[667, 375]} onClose={() => setDetail(undefined)} />
      )}
      <Modal
        centered
        width={600}
        destroyOnClose
        open={visible}
        confirmLoading={loading}
        title="录入项目信息"
        onOk={form.submit}
        onCancel={onCancel}
      >
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 17 }}
          form={form}
          preserve={false}
          onFinish={async (params: any) => {
            setLoading(true);
            try {
              await validForm();
              const urlQuery = settingVRHouse();
              collectEvent(EventTypes.ProductType, { type: 'VR看房' });

              const { id } =
                config.templateId === 0
                  ? await postProject({
                      ...params,
                      enabled3d: true,
                      typeOfPlay: 3,
                      category: 2,
                      templateId: 0, // 新项目
                      pid: 0, // 后端需要
                      versionId: 0, // 空白模板
                    })
                  : await useTemplate(config.templateId, 0, { name: params.name, category: 2, typeOfPlay: 3 });
              message.success('项目创建成功');
              gotoEditor({ id: id!, mode: config.templateId ? 'product' : 'project' }, urlQuery);
            } catch (err) {
              message.error(err.message ? err.message : '项目创建失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Item
            label={`项目名称`}
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请输入项目名称' },
              { max: 20, message: '项目名称不可超过20个字' },
            ]}
          >
            <Input type="string" placeholder={`请输入项目名称`} />
          </Item>
          <Item label="资源类型" valuePropName="assetType">
            <Radio.Group
              options={typeOptions}
              onChange={({ target: { value } }: RadioChangeEvent) => {
                setConfig({
                  ...config,
                  imgId: 0,
                  fileName: [],
                  file: undefined,
                  assetType: value,
                });
              }}
              value={config.assetType}
              optionType="button"
              buttonStyle="solid"
            />
            <a
              target="_blank"
              href="https://bytedance.feishu.cn/docx/doxcnVf0Wppx9ReUWDSzOW3q9af"
              style={{ fontSize: '12px', color: 'gray', marginLeft: '10px' }}
            >
              <Icon component={Book as any} style={{ marginLeft: '5px' }} />
              资源说明
            </a>
          </Item>
          <Item label="资源上传" valuePropName="upload">
            <Upload
              name="file"
              multiple={config.assetType === 1 ? true : false}
              disabled={uploading}
              showUploadList={false}
              accept={accept[config.assetType]}
              beforeUpload={async (file, fileList) => {
                if (fileList.indexOf(file) !== fileList.length - 1) {
                  return false;
                }
                try {
                  setUploading(true);
                  if (config.assetType === 0) {
                    const id = Date.now();
                    await dbServer.set(id, [file]);
                    setConfig({
                      ...config,
                      imgId: id,
                      fileName: fileList.map(i => i.name),
                      file,
                    });
                  }
                  if (config.assetType === 1) {
                    const id = Date.now();
                    await dbServer.set(id, fileList);
                    setConfig({
                      ...config,
                      imgId: id,
                      fileName: fileList.map(i => i.name),
                      file,
                    });
                  }
                  if (config.assetType === 2) {
                    const url = await uploadXingfuliAsset(file);
                    setConfig({
                      ...config,
                      xingfuliUrl: url,
                      fileName: [file.name],
                      file,
                    });
                  }
                } catch (error) {
                  message.error(error.message);
                } finally {
                  setUploading(false);
                  return false;
                }
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                点击{config.fileName.length !== 0 ? '替换' : '上传'}
              </Button>
            </Upload>

            {config.fileName.length !== 0 && (
              <>
                <Button
                  icon={<Icon component={Delete as any} />}
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    setConfig({
                      ...config,
                      fileName: [],
                      file: undefined,
                      imgId: 0,
                      xingfuliUrl: '',
                    });
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  {config.fileName.map((i, idx) => (
                    <span key={idx}>{i}</span>
                  ))}
                </div>
              </>
            )}
          </Item>
          <Item label="选择模板">
            <div style={{ display: 'flex', overflowX: 'scroll' }}>
              <div
                style={{
                  width: '96px',
                  height: '150px',
                  lineHeight: '150px',
                  textAlign: 'center',
                  userSelect: 'none',
                  color: 'blue',
                  fontSize: '36px',
                  border: config.templateId === 0 ? '1px solid blue' : '1px solid gray',
                  flexShrink: 0,
                }}
                onClick={() => {
                  setConfig({
                    ...config,
                    templateId: 0,
                  });
                }}
              >
                空
              </div>
              {templateList.map((i: any, idx) => (
                <div
                  key={idx}
                  style={{
                    margin: '0 10px',
                    position: 'relative',
                    border: config.templateId === i.id ? '2px solid blue' : '1px solid gray',
                  }}
                  onClick={() => {
                    setConfig({
                      ...config,
                      templateId: i.id,
                    });
                  }}
                  onMouseEnter={() => {
                    setHoverTemplate(i.id);
                  }}
                  onMouseLeave={() => {
                    setHoverTemplate(0);
                  }}
                >
                  {config.templateId === i.id && (
                    <Icon
                      component={CheckOne as any}
                      style={{ fontSize: 16, color: 'blue', position: 'absolute', top: '5px', right: '5px' }}
                    />
                  )}
                  {hoverTemplate === i.id && (
                    <Button
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        margin: 'auto',
                        fontSize: '12px',
                      }}
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={async e => {
                        e.stopPropagation();
                        await onPreview(i);
                      }}
                    >
                      查看详情
                    </Button>
                  )}

                  <img src={i.cover} width="96" height="150" alt="" />
                  <p
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      background: 'rgba(0,0,0,.5)',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  >
                    {i.name}
                  </p>
                </div>
              ))}
            </div>
            {config.file && config.templateId !== 0 && (
              <p style={{ marginTop: '10px', fontSize: '11px', color: '#faad14' }}>
                <Icon component={Alarm as any} style={{ marginLeft: '5px' }} />
                上传资源将替换模板内 VR 数据
              </p>
            )}
          </Item>
        </Form>
      </Modal>
    </>
  );
};
