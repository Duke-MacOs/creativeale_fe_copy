import React from 'react';
import { css } from 'emotion';
import { IOperand, OperandSummary } from '../components/operand';

export function highlight(text: any) {
  return (['node', 'func', 'res', 'event', 'store', 'mouse', 'scene'] as IOperand[]).includes(text?.type) ||
    Array.isArray(text) ? (
    <OperandSummary value={text} />
  ) : (
    <span className={css({ fontWeight: 'bold', opacity: 0.62 })}>{text}</span>
  );
}

export function delay(time?: number) {
  if (time && time > 0) {
    return <>延迟{highlight((time / 1000).toFixed(2))}s </>;
  }
  return null;
}
