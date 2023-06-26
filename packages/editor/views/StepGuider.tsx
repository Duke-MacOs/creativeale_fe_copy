import { ComponentPropsWithoutRef, useState } from 'react';
import Guide from 'byte-guide';
import { css, cx } from 'emotion';

export const StepGuider = (rest: ComponentPropsWithoutRef<typeof Guide>) => {
  const [curStep, setCurStep] = useState(1);
  return (
    <Guide
      maskClassName={cx(
        css({
          '&::after': {
            width: 'calc(100% + 2px)!important',
            height: 'calc(100% + 2px)!important',
          },
        }),
        curStep !== 1 &&
          css({
            maxHeight: '100vh!important',
          }),
        curStep === 3 &&
          css({
            borderLeftWidth: '4px !important',
          }),
        curStep === 5 &&
          css({
            borderRightWidth: '8px !important',
          })
      )}
      closable={true}
      showPreviousBtn
      prevText="上一步"
      okText="我知道了"
      stepText={(stepIndex, stepCount) => {
        setCurStep(stepIndex);
        return `${stepIndex}/${stepCount}`;
      }}
      modalClassName={css({
        backgroundColor: '#3955F6 !important',
        boxShadow: 'none !important',
        color: '#fff',
        zIndex: 1002,
        '& .guide-modal-close-icon svg path': {
          stroke: '#fff',
        },
        '& .guide-modal-footer-text': {
          color: '#fff',
        },
        '& .guide-modal-footer-btn': {
          borderRadius: '4px',
          color: '#3955F6',
        },
        '& .guide-modal-content': {
          color: '#fff',
        },
        '& .guide-modal-arrow': {
          backgroundColor: '#3955F6',
        },
        '.guide-modal-footer-prev-btn': {
          color: '#fff',
          background: 'none',
          boxShadow: 'none',
          outline: 'none',
          '&:hover': {
            background: 'none',
          },
          '&:focus': {
            boxShadow: 'none',
          },
        },
      })}
      {...rest}
    />
  );
};
