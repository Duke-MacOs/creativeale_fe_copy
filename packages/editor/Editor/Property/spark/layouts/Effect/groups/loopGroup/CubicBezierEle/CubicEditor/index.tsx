/* eslint-disable react-hooks/exhaustive-deps */
import { IOption } from '@/riko-prop/interface';
import { debounce, isArray, isObject, isString, upperFirst } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CubicBezierEleProps } from '..';
import { BezierPreview } from './svgs/bezier';
import { Buttons } from './Buttons';
import Input from './Input';
import { Preview } from './Preview';
import { SideMenu } from './SideMenu';
import { ChildrenTabs } from './TabsPreview';

export type CubicEditorProps = {
  isNormalValue: boolean;
  activeGroup: IOption | undefined;
  selVal: CubicBezierEleProps['value'] | undefined;
} & Pick<CubicBezierEleProps, 'onChange'>;

export default function CubicEditor({ activeGroup, onChange, selVal, isNormalValue }: CubicEditorProps) {
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const [animating, setAnimating] = useState(false);
  const [bezierValue, setBezier] = useState(defaultCustomBezier);
  const prevCustomBezierRef = useRef<[number, number, number, number]>(defaultCustomBezier);
  const onPreview = useCallback(() => {
    setAnimating(false);
    if (pointerRef.current) {
      // 让游标立即回到初始位置，防止播放过程中切换导致游标以中途为 transform 起点
      pointerRef.current.style.transform = 'none';
      pointerRef.current.style.transition = 'none';
    }
    setTimeout(() => {
      if (pointerRef.current) {
        pointerRef.current.style.transform = '';
        pointerRef.current.style.transition = '';
        pointerRef.current.style.opacity = '';
        setAnimating(true);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (isObject(selVal)) {
      const { x1, y1, x2, y2 } = selVal;
      setBezier([x1, y1, x2, y2]);
      prevCustomBezierRef.current = [x1, y1, x2, y2];
    }
  }, [selVal]);

  useEffect(onPreview, []);

  return (
    <div style={{ display: 'flex' }}>
      <SideMenu
        currentValue={activeGroup?.value}
        onItemClick={group => {
          const params: Record<string, unknown> = {};
          if (isArray(group.children)) {
            const firstChild = group.children[0];
            params.ease = firstChild.value;
          } else {
            if (group.value === 'custom') {
              const [x1, y1, x2, y2] = prevCustomBezierRef.current;
              params.ease = { x1, y1, x2, y2 };
            } else {
              params.ease = group.value;
            }
          }
          onChange(params.ease);
          onPreview();
        }}
      />

      <div style={{ flex: 1, width: 0 }}>
        <ChildrenTabs
          currentValue={selVal}
          children={activeGroup?.children}
          onItemClick={item => {
            onChange(item.value);
            onPreview();
          }}
        />
        <Preview
          selVal={selVal}
          animating={animating}
          pointerRef={pointerRef}
          bezierValue={bezierValue}
          onEditorChange={val => {
            prevCustomBezierRef.current = val;
            setBezier(val);
            onDebounceChange(val, onChange);
          }}
          previewSvg={isString(selVal) && isNormalValue && React.createElement(BezierPreview[upperFirst(selVal)])}
          onTransitionEnd={evt => {
            if (evt.propertyName === 'opacity') {
              if (evt.currentTarget.style.opacity === '0') {
                setAnimating(false);
              }
            }
            if (evt.propertyName === 'transform') {
              evt.currentTarget.style.opacity = animating ? '0' : '';
            }
          }}
          onAnimationEnd={evt => {
            evt.currentTarget.style.opacity = '0';
            setTimeout(() => {
              if (pointerRef.current) {
                pointerRef.current.style.opacity = '';
              }
            }, 400);
          }}
        />
        <Buttons
          previewHelpVisible={Boolean(selVal)}
          resetVisible={isObject(selVal)}
          previewDisable={animating}
          onPreview={onPreview}
          onReset={() => {
            setBezier(defaultCustomBezier);
            onDebounceChange(defaultCustomBezier, onChange);
          }}
          onHelp={() => {
            let baseUrl = `https://easings.net/`;
            // const supportedBezierKey = Object.keys(BezierPreview).filter(item => item !== 'LinearNone'); // LinearNone jump to hash '/'
            const bezierToUrlHashMap: Record<string, string> = {
              backIn: 'easeInBack',
              backOut: 'easeOutBack',
              backInOut: 'easeInOutBack',
              bounceIn: 'easeInBounce',
              bounceOut: 'easeOutBounce',
              bounceInOut: 'easeInOutBounce',
              cubicIn: 'easeInCubic',
              cubicOut: 'easeOutCubic',
              cubicInOut: 'easeInOutCubic',
              elasticIn: 'easeInElastic',
              elasticOut: 'easeOutElastic',
              elasticInOut: 'easeInOutElastic',
            };
            if (typeof selVal === 'string') {
              if (bezierToUrlHashMap[selVal]) {
                baseUrl += `#${bezierToUrlHashMap[selVal]}`;
              }
            }
            // console.debug(`baseUrl`, baseUrl);
            window.open(baseUrl);
          }}
        />
        {isObject(selVal) && (
          <Input
            {...{
              value: [selVal.x1, selVal.y1, selVal.x2, selVal.y2],
              onChange: ([x1, y1, x2, y2]) => onChange({ x1, y1, x2, y2 }),
            }}
          />
        )}
      </div>
    </div>
  );
}

export const defaultCustomBezier: [number, number, number, number] = [0.37, 0, 0.63, 1];

export const onDebounceChange = debounce((bezierValue, onChange) => {
  const [x1, y1, x2, y2] = bezierValue;
  onChange({ x1, y1, x2, y2 });
}, 500);
