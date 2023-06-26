/* eslint-disable react-hooks/exhaustive-deps */
import { OnChange } from '@editor/Editor/Property/cells';
import { Down } from '@icon-park/react';
import { Col, Popover, Tooltip } from 'antd';
import { css } from 'emotion';
import { isArray, isObject, isString, upperFirst } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import CubicEditor from './CubicEditor';
import { EASE_BEZIER_LIST } from './CubicEditor/SideMenu';
import { BezierPreview } from './CubicEditor/svgs/bezier';
import './style.scss';

export interface CubicBezierEleProps {
  label?: string;
  value: string | { x1: number; y1: number; x2: number; y2: number };
  onChange: OnChange;
}

export const CubicBezierEle: React.FC<CubicBezierEleProps> = ({ label, value, onChange }) => {
  const [focused, setFocus] = useState(false);
  const containerWidthRef = useRef(0);
  const selVal = value || undefined;
  const activeGroup = EASE_BEZIER_LIST.find(group => {
    if (isObject(selVal)) {
      return group.value === 'custom';
    }
    return (selVal || '').startsWith(group.value);
  });
  const isNormalValue = !isString(selVal) || !!BezierPreview[upperFirst(selVal)];

  const selectors = useMemo(() => {
    const isAllowed = isNormalValue;
    const labelPrefix = activeGroup?.label || '默认';
    const labelAffix =
      activeGroup && isArray(activeGroup.children)
        ? activeGroup.children.find(item => item.value === selVal)?.label
        : '';
    return (
      <div
        className={css(
          {
            paddingLeft: '68px',
            paddingRight: '16px',
            height: '32px',
            border: '1px solid #f0f0f0',
            color: '#191919',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
          },
          focused
            ? { borderColor: '#3955F6', boxShadow: '0 0 0 2px rgb(57 85 246 / 20%)' }
            : {
                '&:hover': {
                  borderColor: '#3955F6',
                },
              }
        )}
        style={{ cursor: isAllowed ? 'pointer' : 'not-allowed' }}
      >
        <Tooltip title="动画的缓动曲线，决定动画的运动速度" placement="topLeft" mouseEnterDelay={0.5}>
          <h4 className="editor-property-label">{label || '缓动曲线'}</h4>
        </Tooltip>
        <div style={{ lineHeight: '32px' }}>
          {labelPrefix}
          {labelAffix && `-${labelAffix}`}
        </div>
        <Down
          style={{
            position: 'absolute',
            top: '50%',
            right: '11px',
            transform: 'translateY(-50%)',
            lineHeight: '11px',
          }}
          theme="outline"
          size="16"
          fill="#555"
        />
      </div>
    );
  }, [isNormalValue, activeGroup, label, focused, selVal]);

  return (
    <Col>
      <div
        style={{ flex: 1 }}
        ref={container => {
          if (container) {
            containerWidthRef.current = containerWidthRef.current || container.offsetWidth;
          }
        }}
      >
        {isNormalValue ? (
          <Popover
            placement="bottom"
            trigger="click"
            onOpenChange={visible => setFocus(visible)}
            overlayClassName={css({
              width: containerWidthRef.current,
              marginTop: '-8px',
              paddingTop: '0',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',

              '& .ant-popover-arrow': {
                display: 'none',
              },
              '& .ant-popover-inner': {
                padding: '0',
              },
            })}
            content={<CubicEditor {...{ activeGroup, selVal, isNormalValue, onChange }} />}
          >
            {selectors}
          </Popover>
        ) : (
          selectors
        )}
      </div>
    </Col>
  );
};
