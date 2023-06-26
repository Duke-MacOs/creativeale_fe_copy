import React, { useState } from 'react';
import { message, Tooltip } from 'antd';
import { Send } from '@icon-park/react';
import Icon, { QuestionCircleOutlined } from '@ant-design/icons';
import HeaderButton from '../../HeaderButton';
import ReviewDialog from './ReviewDialog';
import { SubmitProps } from '..';
import { collectEvent, EventTypes } from '@editor/utils';

export default function ReviewTemplate({ disabled, skinning, getState, onSaving }: SubmitProps) {
  const [visible, setVisible] = useState(false);
  return (
    <React.Fragment>
      <HeaderButton
        icon={<Icon component={Send as any} />}
        disabled={disabled}
        onClick={async () => {
          collectEvent(EventTypes.OperationButton, {
            type: skinning ? '皮肤送审 ' : '送审 ',
          });
          try {
            await onSaving('送审');
            setVisible(true);
          } catch (e) {
            message.error(e.message);
          }
        }}
      >
        {skinning ? '皮肤送审 ' : '送审 '}
        <Tooltip
          arrowPointAtCenter
          placement="bottomRight"
          title={
            skinning
              ? '皮肤送审后将被推送至Rubeex审核方，审核通过后将上架到对应模板皮肤列表内。'
              : '模板送审后将被推送到Rubeex的审核方，待审核通过后，客户即可使用该模板来创建作品。'
          }
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </HeaderButton>
      {visible && (
        <ReviewDialog skinning={skinning} getState={getState} onSaving={onSaving} onCancel={() => setVisible(false)} />
      )}
    </React.Fragment>
  );
}
