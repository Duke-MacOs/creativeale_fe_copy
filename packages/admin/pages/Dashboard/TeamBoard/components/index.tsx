export * from './Filter';
export * from './Overview';
export * from './OverviewList';
export * from './CasesTrend';
export * from './SceneFlow';
export * from './SankeyDiagram';
export * from './VersionList';
export * from './SceneAnalysis';
export * from './Ranking';
export * from './EffectAnalysis';

import { SpaceProps, Typography, Empty, Spin } from 'antd';
import { TitleProps } from 'antd/lib/typography/Title';
import { merge } from 'lodash';
import { CSSProperties } from 'react';

const { Title } = Typography;

export const Space = ({
  direction = 'vertical',
  size = 8,
  children,
  style,
}: Pick<SpaceProps, 'direction' | 'children' | 'style'> & { size?: number }) => {
  return (
    <div
      style={merge(
        style,
        direction === 'vertical'
          ? {
              display: 'grid',
              rowGap: size,
            }
          : {
              display: 'flex',
              columnGap: size,
            }
      )}
    >
      {children}
    </div>
  );
};

export const LinkTitle = ({ title, style }: { title: string; style?: CSSProperties }) => {
  return (
    <Typography.Link strong style={style}>
      <Space direction="horizontal">
        {title}
        <div>&gt;&gt;</div>
      </Space>
    </Typography.Link>
  );
};
export const EmptyWrapper = ({ height }: { height?: string }) => {
  return (
    <div style={{ height: height ? height : '330px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Empty />
    </div>
  );
};

export const Loading = ({ height, width }: { height?: string; width?: string }) => {
  return (
    <Spin
      style={{
        width: width ? width : '100%',
        height: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};

export const Section = ({ Component, title }: { Component: any; title?: string }) => {
  return (
    <div
      style={{
        borderRadius: '0 0 20px 20px',
        marginBottom: '30px',
        boxShadow: '0px 0px 4px 2px #f0f0f0',
      }}
    >
      {title && (
        <TitleNoMargin
          style={{ padding: '20px 10px', backgroundImage: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)' }}
          level={5}
          children={title}
        />
      )}
      {Component}
    </div>
  );
};

export const TitleNoMargin = ({ color, ...props }: TitleProps & { color?: string }) => {
  return <Title {...{ ...props, style: { ...props.style, color, margin: 0 } }} />;
};

export const GraphTitle = ({ ...props }: TitleProps) => {
  return (
    <Title {...{ ...props, style: { fontSize: '14px', color: '#666666', fontWeight: 300, fontFamily: 'Noto Sans' } }} />
  );
};
