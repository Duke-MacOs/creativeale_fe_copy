import { classnest } from '@editor/utils';
import BezierEditor, { Values } from 'bezier-easing-editor';
import { css } from 'emotion';
import { isNil, isObject, isString } from 'lodash';
import { AnimationEventHandler, ReactNode, RefObject, TransitionEventHandler, useMemo } from 'react';
import { CubicEditorProps } from '..';
import pointerStyles, { BORDER_WIDTH, PADDING, SVG_SCALE_HEIGHT } from './style';
import emptyHolder from '../svgs/empty-box.svg';

export const Preview = ({
  selVal,
  animating,
  onAnimationEnd,
  onEditorChange,
  pointerRef,
  onTransitionEnd,
  previewSvg,
  bezierValue,
}: Pick<CubicEditorProps, 'selVal'> & {
  animating: boolean;
  onTransitionEnd: TransitionEventHandler<HTMLDivElement>;
  onAnimationEnd: AnimationEventHandler<HTMLDivElement>;
  pointerRef: RefObject<HTMLDivElement>;
  onEditorChange: (val: Values) => void;
  previewSvg: ReactNode;
  bezierValue: Values;
}) => {
  const customBezierClassName = useMemo(() => {
    return css({
      transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
      transitionTimingFunction: 'cubic-bezier(' + bezierValue.join(',') + ')',
    });
  }, [bezierValue]);
  const containerSize = { width: 170, height: SVG_SCALE_HEIGHT + BORDER_WIDTH };
  return (
    <div
      style={{
        ...containerSize,
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,
        background: '#F0F0F0',
        boxSizing: 'content-box',
        padding: PADDING.map(item => `${item}px`).join(' '),
      }}
    >
      {isNil(selVal) ? (
        <>
          <img src={emptyHolder} />
          <div
            style={{
              paddingTop: '10px',
              fontSize: '14px',
              lineHeight: '22px',
              color: '#C1C1C1',
            }}
          >
            无相关动效曲线
          </div>
        </>
      ) : (
        <>
          <div
            className={css({
              position: 'relative',
              width: '100%',
              height: '100%',
              borderLeft: `${BORDER_WIDTH}px solid #ccc`,
              borderBottom: `${BORDER_WIDTH}px solid #ccc`,
              // svg元素的样式
              '& .bezier-line': {
                width: '100%',
                display: 'block',
                fill: 'none',
                stroke: '#666',
                strokeWidth: '1px',
                strokeLinecap: 'round',
                overflow: 'visible',
              },
            })}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: 0,
                fontSize: '12px',
                color: '#ccc',
              }}
            >
              t
            </div>
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '2px',
                fontSize: '12px',
                color: '#ccc',
              }}
            >
              x
            </div>
            <div
              ref={pointerRef}
              className={classnest({
                [pointerStyles.main]: 1,
                [pointerStyles.animate]: animating,
                [isString(selVal) ? pointerStyles[selVal as keyof typeof pointerStyles] : customBezierClassName]:
                  animating,
              })}
              onTransitionEnd={onTransitionEnd}
              onAnimationEnd={onAnimationEnd}
            >
              <div className={pointerStyles.top} />
            </div>

            {isString(selVal) && previewSvg}
          </div>
          {isObject(selVal) && (
            <BezierEditor
              {...{
                style: {
                  position: 'absolute',
                },
                textStyle: {
                  fontSize: '0',
                  fill: '#222',
                },
                background: 'transparent',
                curveColor: '#666',
                curveWidth: 1,
                gridColor: 'transparent',
                handleColor: '#3955F6',
                handleStroke: 1,
                width: containerSize.width + PADDING[1] + PADDING[3],
                height: containerSize.height + PADDING[0] + PADDING[2],
                value: bezierValue,
                padding: PADDING,
                onChange: onEditorChange,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
