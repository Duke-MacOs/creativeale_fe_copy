import { postProject } from '@shared/api/project';
import { fetchTemplates, previewTemplate, useTemplate } from '@shared/api/template';
import { amIHere, gotoEditor } from '@shared/utils';
import Icon, { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Previewer } from '@editor/Editor/Header';
import { dbServer } from '@editor/Template/Panorama/utils';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { Delete } from '@icon-park/react';
import { Button, Form, Input, message, Modal, Upload } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { CheckOne } from '@icon-park/react';
import { listProject } from '../api/listProject';

const { Item } = Form;

const CAR_TEMPLATE_SEARCH_PARAMS = {
  page: 1,
  pageSize: 50,
  status: '30', // 已通过
  tagId: 401010, // 3D看车
  industry: String(1 << 7),
};

export default ({ visible, onCancel }: { visible: boolean; onCancel: () => void }) => {
  const [hoverTemplate, setHoverTemplate] = useState(0);
  const [detail, setDetail] = useState<any>();
  const [templateList, setTemplateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<{
    templateId: number;
    fileId: number;
    fileName: string[];
    file: File | undefined;
  }>({
    templateId: 0,
    fileId: 0,
    fileName: [],
    file: undefined,
  });
  const [form] = Form.useForm<{
    name: string;
  }>();

  const setting3DCar = useCallback(
    (urlQuery = {}) => {
      if (config.templateId === 0) {
        urlQuery.emptyCar = '1';
      }
      if (config.fileId !== 0) {
        urlQuery.fileId = config.fileId;
      }
      urlQuery.initialCar = '1';
      return urlQuery;
    },
    [config]
  );

  useEffect(() => {
    const fetchVRHouseTemplate = async () => {
      const data: any = amIHere({ online: true })
        ? await listProject(CAR_TEMPLATE_SEARCH_PARAMS)
        : await fetchTemplates(CAR_TEMPLATE_SEARCH_PARAMS as any);
      setTemplateList(data.list);
      setConfig({ ...config, templateId: data.list[0]?.id });
    };
    visible && fetchVRHouseTemplate();
  }, [visible]);

  const validForm = async () => {
    if (config.templateId === 0) {
      throw new Error('无模板，不可创建项目');
    }
    return true;
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
              const urlQuery = setting3DCar();
              collectEvent(EventTypes.ProductType, { type: 'VR项目' });

              const { id } =
                config.templateId === 0
                  ? await postProject({
                      ...params,
                      enabled3d: true,
                      typeOfPlay: 7,
                      category: 1,
                      templateId: 0, // 新项目
                      pid: 0, // 后端需要
                      versionId: 0, // 空白模板
                    })
                  : await useTemplate(config.templateId, 0, { name: params.name, category: 4 });
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
          <Item label="资源上传" valuePropName="upload">
            <Upload
              name="file"
              disabled={uploading}
              showUploadList={false}
              accept=".zip,.glb"
              beforeUpload={async (file, fileList) => {
                try {
                  setUploading(true);
                  const id = Date.now();
                  await dbServer.set(id, [file]);
                  setConfig({
                    ...config,
                    fileId: id,
                    fileName: fileList.map(i => i.name),
                    file,
                  });
                  return false;
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
          </Item>
        </Form>
      </Modal>
    </>
  );
};
