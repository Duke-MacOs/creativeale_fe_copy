import type { SparkProps, IVisitSpark, Spark } from './types';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { notNullSpark, NULL_SPARK } from './utils';
import { Fragment, useContext } from 'react';
import { CellContext } from './ValueCell';
import { Button, Tooltip } from 'antd';
import { css } from 'emotion';

export const VisitCell = ({ index, label, content, extra, fallback, render }: SparkProps<IVisitSpark>) => {
  const {
    visiting: { next = [index], prev = [], onVisit },
  } = useContext(CellContext);

  const getContent = (): Spark => {
    if (!next.length) {
      return fallback?.(() => onVisit(prev.map(({ index }) => index).concat(index))) || NULL_SPARK;
    }
    if (next[0] !== index) {
      return NULL_SPARK;
    }
    if (next.length > 1) {
      return notNullSpark(
        notNullSpark(targetContent(content, next[1]), targetContent(extra || NULL_SPARK, next[1])),
        content
      );
    }
    if (!prev.length) {
      return content;
    }
    return {
      spark: 'grid',
      content: [returnButtonSpark(), content],
    };
  };

  const targetContent = (content: Spark, index: string | number): Spark => {
    switch (content.spark) {
      case 'flex':
      case 'grid':
        const targets = content.content
          .map(content => targetContent(content, index))
          .filter(content => content !== NULL_SPARK);
        switch (targets.length) {
          case 0:
            return NULL_SPARK;
          case 1:
            return targets[0];
          default:
            return {
              spark: 'element',
              content: () => (
                <>
                  {targets.map((content, index) => (
                    <Fragment key={index}>{render(content)}</Fragment>
                  ))}
                </>
              ),
            };
        }
      case 'context':
      case 'enter':
        const target = targetContent(content.content, index);
        if (target !== NULL_SPARK) {
          return {
            ...content,
            content: target,
          };
        }
        return NULL_SPARK;
      case 'group':
        return notNullSpark(targetContent(content.content, index), targetContent(content.extra || NULL_SPARK, index));
      case 'check':
      case 'block':
      case 'group':
      case 'label':
        return targetContent(content.content, index);
      case 'visit':
        if (content.index === index) {
          return content;
        }
        return NULL_SPARK;
      case 'value':
        if (content.visit) {
          return {
            ...content,
            content(value: any, onChange: any) {
              return targetContent(content.content(value, onChange), index);
            },
          };
        }
        return NULL_SPARK;
      default:
        return NULL_SPARK;
    }
  };

  const returnButtonSpark = (): Spark => {
    return {
      spark: 'element',
      content: () => (
        <div
          className={css({
            padding: '16px 16px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <Tooltip title={`返回${prev[prev.length - 1].label}`}>
            <Button
              type="text"
              size="small"
              className={css({ padding: 0, overflow: 'hidden', ':hover': { background: 'none' } })}
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                onVisit(prev.map(({ index }) => index));
              }}
            >
              {label}
            </Button>
          </Tooltip>
          {extra && render(extra)}
        </div>
      ),
    };
  };

  return render({
    spark: 'context',
    content: getContent(),
    provide() {
      return {
        visiting: {
          next: next.slice(1),
          prev: prev.concat({ label, index }),
          onVisit,
        },
      };
    },
  });
};
