import React from 'react';
import { Typography } from 'antd';
import type { BaseType } from 'antd/lib/typography/Base';

type Items = (string | JSX.Element | { type?: BaseType; text: string })[];

const is = (item: any): item is { type?: BaseType; text: string } => typeof item?.text === 'string';

export const toColorful = (...items: Items) => (
  <>
    {items.map((item, index) =>
      is(item) ? (
        <Typography.Text key={index} strong>
          {item.text}
        </Typography.Text>
      ) : (
        item
      )
    )}
  </>
);

export const throwColorful = (...items: Items) => {
  throw new Err(items);
};

class Err extends Error {
  constructor(items: Items) {
    super();
    this.message = toColorful(...items) as any;
  }
}
