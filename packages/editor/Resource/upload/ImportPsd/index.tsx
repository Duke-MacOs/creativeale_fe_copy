import React, { useState, useCallback } from 'react';
import { Modal, Button, Form, Upload, Switch, message, Tooltip } from 'antd';
import { UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { INodeData } from '@byted/riko';
import PSD from 'psd.js';
import JSZip from 'jszip';
import { createResourceAutoCompress } from '@shared/api';
import { ResourceType } from '../accepted';
import { parse as parsePSD, filter as filterPSD, toNodeState } from './psdParse';
import { fromFiles } from '../UploadFiles/fromFiles';
import { useProject } from '@editor/aStore';

type onFinishParam = Unpack<ReturnType<NonNullable<Unpack<ReturnType<typeof fromFiles>>>>>;
interface IProps {
  onHide(): void;
  onFinish(param: onFinishParam[]): void;
}

export function ImportPsdDialog({ onHide, onFinish }: IProps) {
  const [form] = Form.useForm();
  const projectId = useProject('id');
  const [saving, setSaving] = useState(false);

  const normFile = useCallback((e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }, []);

  const handleConfirm = useCallback(() => {
    form
      .validateFields()
      .then(async ({ psdFiles, importByGroup }) => {
        setSaving(true);
        const tasks: Array<Promise<any>> = [];

        for (const file of psdFiles) {
          const zip = new JSZip();
          const imageTaskQueue: Array<Record<string, unknown>> = [];

          const originFile = file.originFileObj;
          const psdName = originFile.name.split('/').pop()?.split('.')[0] || 'PSD';
          const psd = await PSD.fromDroppedFile(originFile);
          const psdNode = await parsePSD(psd.tree(), importByGroup);
          filterPSD(psdNode);

          psdNode.name = originFile.name;
          const node = toNodeState(psdNode, imageTaskQueue) as INodeData;
          for (let i = 0; i < imageTaskQueue.length; i = i + 3) {
            const imageTasks = [];
            for (let k = 0; k < 3; k++) {
              if (i + k >= imageTaskQueue.length) {
                break;
              }
              const file = imageTaskQueue[i + k]._$imageFile as File;
              imageTasks.push(
                createResourceAutoCompress({
                  file,
                  type: ResourceType['Sprite'],
                  cover: '',
                  projectId,
                  distinct: true,
                  fileName: file.name,
                })
              );
            }
            const imageResults = await Promise.all(imageTasks);
            for (let k = 0; k < imageTasks.length; k++) {
              imageTaskQueue[i + k].url = imageResults[k].url;
              delete imageTaskQueue[i + k]._$imageFile;
            }
            if (imageTasks.length < 3) break;
          }

          const jsonName = 'psd.json';
          zip.file(jsonName, new File([JSON.stringify(node)], jsonName, { type: 'application/json' }));
          const zipFile = await zip.generateAsync({ type: 'blob' }).then(blob => {
            return new File([blob], `${psdName}_psd.zip`, { type: 'application/zip' });
          });
          tasks.push(
            createResourceAutoCompress({
              file: zipFile,
              type: ResourceType['PSD'],
              cover: '',
              projectId,
              fileName: zipFile.name,
            }).then(({ id, url, cover }) => {
              return { id, url, cover, name: `${psdName}_psd`, extra: {}, mime: 'PSD' as const };
            })
          );
        }
        return Promise.all(tasks);
      })
      .then(dataList => {
        message.success('导入成功');
        onFinish(dataList);
        onHide();
      })
      .catch(err => {
        setSaving(false);
        if (err.message) {
          message.error(err.message, 5);
        }
      });
  }, [form, projectId, onHide, onFinish]);

  return (
    <Modal
      title="导入PSD"
      open={true}
      bodyStyle={{ position: 'relative' }}
      okText="确认"
      cancelText="取消"
      okButtonProps={{ disabled: saving, loading: saving }}
      onCancel={onHide}
      onOk={handleConfirm}
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ psd: null, importByGroup: false }}
      >
        <Form.Item label="上传PSD">
          <Form.Item
            noStyle
            name="psdFiles"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: '请上传PSD文件' }]}
          >
            <Upload showUploadList={true} accept="image/vnd.adobe.photoshop" beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form.Item>

        <Form.Item
          label={
            <Tooltip
              title={<div>是否将组内图层合并成一个节点，以$$为前缀命名的组可保持原有结构导入</div>}
              overlayInnerStyle={{ letterSpacing: 'pre-line' }}
            >
              是否按组导入
            </Tooltip>
          }
        >
          <Form.Item noStyle name="importByGroup" valuePropName="checked">
            <Switch size="small" defaultChecked={true} />
          </Form.Item>
        </Form.Item>
      </Form>
      <Button
        type="link"
        style={{ position: 'absolute', left: '9px', bottom: '-42px' }}
        icon={<QuestionCircleOutlined />}
        onClick={() => window.open('https://magicplay.oceanengine.com/tutorials/docs/import-psd')}
      >
        查看帮助文档
      </Button>
    </Modal>
  );
}
