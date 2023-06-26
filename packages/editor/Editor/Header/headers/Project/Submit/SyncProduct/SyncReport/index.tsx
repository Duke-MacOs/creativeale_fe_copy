import React from 'react';
import { Modal, Table, Button } from 'antd';
import { Attention, Close, CloseOne } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { css } from 'emotion';
import { copyText } from '@shared/utils';

type Result = {
  aadvids: string[];
  message: string;
  action: string;
  grantUrl?: string;
};

export interface SyncReportProps {
  succeeded: number;
  results: Result[];
  onCancel(): void;
}

const FilledAttention = (props: any) => <Attention {...props} theme="filled" />;
const FilledCloseOne = (props: any) => <CloseOne {...props} theme="filled" />;

export default function SyncReport({ succeeded, results, onCancel }: SyncReportProps) {
  const failed = results.reduce((sum, { aadvids }) => sum + aadvids.length, 0);
  return (
    <Modal
      open
      width={600}
      footer={null}
      onCancel={onCancel}
      closeIcon={<Icon component={Close as any} />}
      title={
        succeeded ? (
          <React.Fragment>
            <Icon component={FilledAttention} style={{ color: '#FAAD15' }} />
            &nbsp;{succeeded}个账号推送成功，{failed}个账号推送失败
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Icon component={FilledCloseOne} style={{ color: '#F45858' }} />
            &nbsp;{failed}个账号全部推送失败
          </React.Fragment>
        )
      }
    >
      <Table bordered dataSource={results} pagination={false}>
        <Table.Column
          key="aadvids"
          title="推送失败账号"
          dataIndex="aadvids"
          render={aadvids => aadvids.map((aadvid: number) => <div key={aadvid}>{aadvid}</div>)}
        />
        <Table.Column key="message" title="失败原因" dataIndex="message" width="25%" />
        <Table.Column key="action" title="操作" dataIndex="action" render={renderAction} />
      </Table>
    </Modal>
  );
}

const renderAction = (action: string, { grantUrl }: Result) =>
  grantUrl ? (
    <React.Fragment>
      <div>{action}</div>
      <div
        className={css({
          background: '#F8F9FA',
          wordBreak: 'break-all',
          padding: '8px 12px',
          color: '#999999',
          button: {
            width: '100%',
          },
        })}
      >
        {grantUrl}
      </div>
      <Button type="primary" style={{ width: '100%' }} onClick={() => copyText(grantUrl, { tip: true })}>
        复制链接并分享给广告主
      </Button>
    </React.Fragment>
  ) : (
    action
  );
