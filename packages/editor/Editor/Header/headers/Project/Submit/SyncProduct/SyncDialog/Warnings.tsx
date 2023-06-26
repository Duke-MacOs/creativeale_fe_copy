import { memo, useState } from 'react';
import Icon from '@ant-design/icons';
import { Button, Form } from 'antd';
import { DoubleDown, DoubleUp } from '@icon-park/react';
import { collectEvent, EventTypes } from '@editor/utils';
import useWarnings from './useWarnings';
import { css } from 'emotion';
import { toColorful } from '@shared/utils';

export default memo(({ firstSceneSize, hasWarnings }: any) => {
  const [collapsed, setCollapsed] = useState(true);
  const warnings = useWarnings(firstSceneSize).map((message, index) => toColorful(`${index + 1}. `, message));
  hasWarnings.current = warnings.length;
  if (!warnings.length) {
    return null;
  } else {
    collectEvent(EventTypes.RiskAlert, {
      from: '同步中曝光',
    });
  }
  return (
    <Form.Item label="风险提示">
      <div style={{ width: 300, userSelect: 'text' }}>
        {(collapsed ? warnings.slice(0, 1) : warnings).map((warning, index) => (
          <div key={index}>{warning}</div>
        ))}
      </div>
      {warnings.length > 1 && (
        <div
          className={css({
            button: {
              padding: 0,
            },
            'button+button': {
              marginLeft: 16,
            },
          })}
        >
          {collapsed ? (
            <Button
              type="link"
              icon={<Icon component={DoubleDown as any} />}
              onClick={() => {
                setCollapsed(false);
              }}
            >
              展开全部
            </Button>
          ) : (
            <Button
              type="link"
              icon={<Icon component={DoubleUp as any} />}
              onClick={() => {
                setCollapsed(true);
              }}
            >
              收起全部
            </Button>
          )}
        </div>
      )}
    </Form.Item>
  );
});
