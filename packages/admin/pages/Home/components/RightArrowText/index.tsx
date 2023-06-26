import React from 'react';
import RightArrowSvg from '../../common/svgs/RightArrowSvg';
import './style.less';

interface IRightArrowText {
  content: React.ReactNode;
  arrowSize: number;
  arrowColor: string;
  arrowStyle: React.CSSProperties;
}

export default function RightArrowText(props: IRightArrowText) {
  const { content, arrowSize, arrowColor, arrowStyle } = props;
  return (
    <div className="flex-row-center right-arrow-text">
      <div className="right-arrow-text-content">{content}</div>
      <div className="right-arrow-text-arrow flex-row-left transition-300-ms">
        <RightArrowSvg fill={arrowColor} width={arrowSize} height={arrowSize} style={arrowStyle} />
      </div>
    </div>
  );
}
