import React, { useEffect, useState } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { checkPlayableAreaBase } from '@editor/aStore';
import { getScene } from '@editor/utils';
import { useStore } from 'react-redux';
import { debounce } from 'lodash';
import { Typography } from 'antd';
import { css } from 'emotion';

export default function WarnBar() {
  const { subscribe, getState } = useStore();
  const [warning, setWarning] = useState<React.ReactNode>(null);
  useEffect(() => {
    return subscribe(
      debounce(() => {
        const scene = getScene(getState().project);
        const warnings = Array.from(checkPlayableAreaBase(scene));
        if (!warnings.length) {
          return setWarning(null);
        }
        if (warnings.length < 4) {
          return setWarning(
            `${scene.name}中存在${warnings
              .map(({ nodeName }) => nodeName)
              .join('、')}元素在限制互动区域，可能会影响互动效果，请及时预览检查`
          );
        }
        return setWarning(
          `${scene.name}中存在${warnings
            .slice(0, 3)
            .map(({ nodeName }) => nodeName)
            .join('、')}等${warnings.length}个元素在限制互动区域，可能会影响互动效果，请及时预览检查`
        );
      }, 1000)
    );
  }, [getState, subscribe]);

  if (!warning) {
    return null;
  }

  return (
    <div
      className={css({
        flex: '0 0 30px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.08)',
        fontSize: 12,
        width: '100%',
        paddingLeft: 16,
        lineHeight: '30px',
        zIndex: 1,
      })}
    >
      <Typography.Text type="warning">
        <ExclamationCircleFilled />
      </Typography.Text>{' '}
      {warning}
    </div>
  );
}
