import React from 'react';
import { css } from 'emotion';

export const highlightText = (text: string, mark: string): React.ReactNode => {
  if (!text || !mark || !text.includes(mark)) {
    return text;
  }
  return text.split(mark).reduce((spans, span, index) => {
    if (index) {
      spans.push(
        <span key={index} className={css({ color: '#f50' })}>
          {mark}
        </span>
      );
    }
    if (span) {
      spans.push(span);
    }
    return spans;
  }, [] as React.ReactNode[]);
};
