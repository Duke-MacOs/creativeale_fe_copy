import { postProject } from '@shared/api/project';
import { gotoEditor } from '@shared/utils';
import Icon from '@ant-design/icons';
import { Down } from '@icon-park/react';
import { Button, Checkbox, Dropdown, Form, Input, message, Modal } from 'antd';
import { css } from 'emotion';
import { useState } from 'react';
import CreateVRModal from './CreateVRModal';
import CreateVRVideo from './CreateVRVideo';
import CreateCarModal from './CreateCarModal';
import { useRoutes } from '@main/routes';
import { useHistory } from 'react-router';
import { typeOfPlayMap } from '@editor/Editor/Header/headers/Project/CaseName';
import { collectEventTableAction } from '@main/collectEvent';
import { useHasFeature } from '@shared/userInfo';

const { Item } = Form;

export default () => {
  const [typeIndex, setTypeIndex] = useState(-1);
  const [form] = Form.useForm<{
    name: string;
    enable3d?: boolean;
    description: string;
  }>();
  const [loading, setLoading] = useState(false);
  const { replace } = useHistory();
  const { routes } = useRoutes();
  const allFeature = useHasFeature();
  const directPlayFeature = useHasFeature('<direct_play>');

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      })}
    >
      <Dropdown
        trigger={['click']}
        menu={{
          items: Object.values(typeOfPlayMap)
            .filter(type => {
              switch (type) {
                case '互动落地页':
                  return true;
                case '直出互动':
                  return directPlayFeature;
                default:
                  return allFeature;
              }
            })
            .map(
              (type, index) =>
                type && {
                  label: (
                    <div
                      onClick={() => {
                        const typeOfPlay = Number(
                          Object.fromEntries(Object.entries(typeOfPlayMap).map(([key, value]) => [value, key]))[type]
                        );
                        collectEventTableAction('新建项目')('okay', { typeOfPlay });
                        setTypeIndex(typeOfPlay);
                      }}
                    >
                      {type}
                    </div>
                  ),
                  key: index,
                }
            ),
        }}
      >
        <Button type="primary">
          新建项目 <Icon component={Down as any} />
        </Button>
      </Dropdown>
      <div style={{ height: 24, width: 1, background: '#e1e1e1', margin: '0 16px' }} />
      <Button
        type="primary"
        onClick={() => {
          collectEventTableAction('从模板创建')('okay');
          replace(routes.find(({ path }) => path.includes('/pub/template'))!.pathOf());
        }}
      >
        从模板创建
      </Button>
      <Modal
        centered
        width={600}
        destroyOnClose
        open={typeIndex > -1 && typeIndex !== 5 && typeIndex !== 6 && typeIndex !== 7}
        confirmLoading={loading}
        title="录入项目信息"
        onOk={form.submit}
        onCancel={() => setTypeIndex(-1)}
      >
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 17 }}
          form={form}
          preserve={false}
          onFinish={async (params: any) => {
            setLoading(true);
            try {
              const { id } = await postProject({
                ...params,
                enabled3d: params.enabled3d,
                typeOfPlay: typeIndex,
                category: params.enabled3d ? 1 : 0,
                templateId: 0, // 新项目
                pid: 0, // 后端需要
                versionId: 0, // 空白模板
              });
              message.success('项目创建成功');
              gotoEditor({ id: id!, mode: 'project' });
            } catch (err) {
              message.error(err.message ? err.message : '项目创建失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Item
            label="项目名称"
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请输入项目名称' },
              { max: 20, message: '项目名称不可超过20个字' },
            ]}
          >
            <Input type="string" placeholder="请输入项目名称" />
          </Item>
          <Item
            label="项目描述"
            name="description"
            rules={[
              { whitespace: true, message: '项目描述不能为空格' },
              { max: 128, message: '项目描述不可超过128个字' },
            ]}
          >
            <Input.TextArea
              showCount
              maxLength={128}
              placeholder="请输入项目描述"
              className={css({
                '&>textarea.ant-input': {
                  height: '100px',
                },
              })}
            />
          </Item>
          {allFeature && typeIndex !== 4 && (
            <Item valuePropName="checked" name="enabled3d">
              <Checkbox
                className={css({
                  marginLeft: '115px',
                  fontsize: '12px',
                  color: '#8c8c8c',
                })}
              >
                是否3D项目
              </Checkbox>
            </Item>
          )}
        </Form>
      </Modal>
      <CreateVRModal
        visible={typeIndex === 5}
        onCancel={() => {
          setTypeIndex(-1);
        }}
      />
      <CreateVRVideo
        visible={typeIndex === 6}
        onCancel={() => {
          setTypeIndex(-1);
        }}
      />
      <CreateCarModal
        visible={typeIndex === 7}
        onCancel={() => {
          setTypeIndex(-1);
        }}
      />
    </div>
  );
};
