import React, { useState, useRef } from 'react';
import { Input, Tabs } from 'antd';
import { useDebounceFn } from '@byted/hooks';
import { baseEffect, baseIcons } from './baseEffect';
import { baseEffect as baseEffect3D, baseIcons as baseIcons3D } from './baseEffect3D';
import { inEffect, inIcons } from './inEffect';
import { maskEffect, maskInIcons, maskOutIcons } from './maskEffect';
import { loopEffect, loopIcons } from './loopEffect';
import { loopEffect as loopEffect3D, loopIcons as loopIcons3D } from './loopEffect3D';
import { outEffect, outIcons } from './outEffect';
import { getStorage } from './storage';
import { SearchOutlined } from '@ant-design/icons';
import EffectPane, { EffectPaneProps } from './EffectPane';
import emptyHolder from './emptyHolder.svg';
import './style.scss';
import { useEditor } from '@editor/aStore';

export { default as useEffectIcon } from './useEffectIcon';

export const CNP = 'effect-changer';

export interface EffectListProps extends Pick<EffectPaneProps, 'onClick'> {
  __script?: [string?, string?];
}

const emptyDict: Record<string, boolean> = {
  inEffect: true,
  outEffect: true,
  loopEffect: true,
  baseEffect: true,
};

export default function Effect({ onClick, __script: [group, active] = [] }: EffectListProps) {
  const { edit3d } = useEditor('edit3d');
  const [keyword, setKeyword] = useState('');
  const [isEmpty, setEmpty] = useState<typeof emptyDict>({ ...emptyDict });
  const emptyRef = useRef({ ...emptyDict });

  const search = (
    <Input
      className={`${CNP}-effect-input`}
      placeholder="请输入"
      maxLength={10}
      prefix={<SearchOutlined />}
      onChange={({ target: { value } }) => {
        emptyRef.current = { ...emptyDict };
        setKeyword(value);
      }}
    />
  );

  const { run: syncEmpty } = useDebounceFn(() => setEmpty({ ...emptyRef.current }), 100, [keyword]);

  const handleQueryChange = (group: string, count: number) => {
    if (count > 0) {
      emptyRef.current[group] = false;
    }
  };

  return (
    <div className={`${CNP}-effect-container`}>
      <Tabs defaultActiveKey={group || 'inEffect'} tabBarExtraContent={search} onChange={() => syncEmpty()}>
        <Tabs.TabPane tab="进场" key="inEffect">
          {keyword && isEmpty.inEffect && <Empty />}
          {!keyword && (
            <EffectPane
              title={inEffect[0].name}
              active={active}
              data={edit3d ? [] : getStorage('inEffect', [...inEffect, ...maskEffect])}
              group="inEffect"
              icons={{ ...inIcons, ...maskInIcons }}
              defaultIcon={inIcons.一直显示}
              keyword={keyword}
              onClick={onClick}
            />
          )}
          {inEffect.slice(1).map(item => {
            return (
              <EffectPane
                key={`in_${item.key}`}
                title={item.name}
                active={active}
                data={edit3d ? [] : item.list}
                group="inEffect"
                icons={inIcons}
                defaultIcon={inIcons.一直显示}
                keyword={keyword}
                onClick={onClick}
                onQueryChange={handleQueryChange}
              />
            );
          })}
          <EffectPane
            key={`in_${maskEffect[0].key}`}
            title={maskEffect[0].name}
            active={active}
            data={edit3d ? [] : maskEffect[0].list}
            group="inEffect"
            icons={maskInIcons}
            defaultIcon={maskInIcons.三叶草}
            keyword={keyword}
            onClick={onClick}
            onQueryChange={handleQueryChange}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="退场" key="outEffect">
          {keyword && isEmpty.outEffect && <Empty />}
          {!keyword && (
            <EffectPane
              title={outEffect[0].name}
              active={active}
              data={edit3d ? [] : getStorage('outEffect', [...outEffect, ...maskEffect])}
              group="outEffect"
              icons={{ ...outIcons, ...maskOutIcons }}
              defaultIcon={outIcons.一直显示}
              keyword={keyword}
              onClick={onClick}
            />
          )}
          {outEffect.slice(1).map(item => {
            return (
              <EffectPane
                key={`in_${item.key}`}
                title={item.name}
                active={active}
                data={edit3d ? [] : item.list}
                group="outEffect"
                icons={outIcons}
                defaultIcon={outIcons.一直显示}
                keyword={keyword}
                onClick={onClick}
                onQueryChange={handleQueryChange}
              />
            );
          })}
          <EffectPane
            key={`out_${maskEffect[0].key}`}
            title={maskEffect[0].name}
            active={active}
            data={
              edit3d
                ? []
                : maskEffect[0].list.map(effect => ({ ...effect, props: { ...effect.props, isInEffect: false } }))
            }
            group="outEffect"
            icons={maskOutIcons}
            defaultIcon={maskOutIcons.三叶草}
            keyword={keyword}
            onClick={onClick}
            onQueryChange={handleQueryChange}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="循环" key="loopEffect">
          {!edit3d ? (
            <>
              {keyword && isEmpty.loopEffect && <Empty />}
              {!keyword && (
                <EffectPane
                  title={loopEffect[0].name}
                  active={active}
                  data={getStorage('loopEffect', loopEffect)}
                  group="loopEffect"
                  icons={loopIcons}
                  defaultIcon={loopIcons.上下振动}
                  keyword={keyword}
                  onClick={onClick}
                />
              )}
              {loopEffect.slice(1).map(item => {
                return (
                  <EffectPane
                    key={`loop_${item.key}`}
                    title={item.name}
                    active={active}
                    data={edit3d ? [] : item.list}
                    group="loopEffect"
                    icons={loopIcons}
                    defaultIcon={loopIcons.上下振动}
                    keyword={keyword}
                    onClick={onClick}
                    onQueryChange={handleQueryChange}
                  />
                );
              })}
            </>
          ) : (
            <EffectPane
              title={loopEffect3D[0].name}
              active={active}
              data={loopEffect3D[0].list}
              group="loopEffect3D"
              icons={loopIcons3D}
              defaultIcon={loopIcons.呼吸效果}
              keyword={keyword}
              onClick={onClick}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="通用" key="baseEffect">
          {!edit3d ? (
            <>
              {keyword && isEmpty.baseEffect && <Empty />}
              <EffectPane
                active={active}
                data={edit3d ? baseEffect3D[0].list : baseEffect[0].list}
                group="baseEffect"
                icons={edit3d ? baseIcons3D : baseIcons}
                defaultIcon={baseIcons.一直显示}
                keyword={keyword}
                onClick={onClick}
                onQueryChange={handleQueryChange}
              />
            </>
          ) : (
            <EffectPane
              active={active}
              data={baseEffect3D[0].list}
              group="baseEffect3D"
              icons={baseIcons3D}
              defaultIcon={baseIcons3D.位移动画}
              keyword={keyword}
              onClick={onClick}
              onQueryChange={handleQueryChange}
            />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

function Empty() {
  return (
    <div style={{ paddingTop: '30px', textAlign: 'center', color: '#999' }}>
      <img src={emptyHolder} style={{ maxWidth: '100%' }} />
      <div>没有找到相关动画</div>
    </div>
  );
}
