import { amIHere } from '@shared/utils';
import Icon from '@ant-design/icons';
import { useVisible } from '@editor/hooks';
import { collectEvent, EventTypes } from '@editor/utils';
import { Help as HelpIcon } from '@icon-park/react';
import { Badge, Dropdown, Menu, Upload } from 'antd';
import { useState } from 'react';
import HeaderButton from '../HeaderButton';
import { uploadRubeexPlayable } from '../Submit/ExportProject/ExportDialog';
import newTag from '../../../../Property/spark/layouts/Script/Event/new_tag.gif';
import { css } from 'emotion';

export default function Help() {
  const [loading, setLoading] = useState(false);
  const [changelog, setChangelog] = useVisible('changelog', {
    nextValue: PACKAGE_VERSION,
    byStep: false,
  });
  let dummyKey = 0;
  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            key={dummyKey++}
            onClick={() => {
              setChangelog(false);
              collectEvent(EventTypes.OperationButton, {
                type: '更新日志',
              });
              if (amIHere({ online: true })) {
                window.open('https://bytedance.feishu.cn/docs/doccn8nDt4jSAE83zoibe09TYwc');
              } else {
                window.open('https://bytedance.feishu.cn/wiki/wikcn8s1H2JBm9PdWDFA0So1D8d');
              }
            }}
          >
            <Badge dot={changelog} offset={[2, -2]}>
              更新日志
            </Badge>
          </Menu.Item>
          <Menu.Item
            key={dummyKey++}
            onClick={() => {
              collectEvent(EventTypes.OperationButton, {
                type: '教程中心',
              });
              collectEvent(EventTypes.Tutorial, {
                type: '帮助按钮',
              });
              window.open('https://magicplay.oceanengine.com/tutorials/middle/seven');
            }}
            className={css({
              display: 'flex',
              alignItems: 'center',
            })}
          >
            教程中心
            <img style={{ width: 20, height: 12, marginLeft: 6 }} src={newTag} />
          </Menu.Item>
          <Menu.Item
            key={dummyKey++}
            onClick={() => {
              collectEvent(EventTypes.OperationButton, {
                type: '示例项目',
              });
              window.open(`${location.origin}/public`);
            }}
          >
            示例项目
          </Menu.Item>
          {amIHere({ release: false }) && (
            <Upload
              key={dummyKey++}
              accept=".zip"
              fileList={[]}
              beforeUpload={file => {
                setLoading(true);
                const form = new FormData();
                form.set('file', file);
                uploadRubeexPlayable(form).finally(() => {
                  setLoading(false);
                });
              }}
            >
              <Menu.Item>上传Zip包到Ad平台</Menu.Item>
            </Upload>
          )}
        </Menu>
      }
      placement="bottomLeft"
    >
      <HeaderButton loading={loading} dot={changelog} icon={<Icon component={HelpIcon as any} />}>
        帮助
      </HeaderButton>
    </Dropdown>
  );
}
