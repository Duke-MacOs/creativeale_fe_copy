import { isArrayOperator, isObjectOperator, operatorSpark, operatorSummary } from './operator';
import render, { Spark } from '@editor/Editor/Property/cells';
import { operandSpark, OperandSummary } from './operand';
import { useState, Fragment } from 'react';
import { theme, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import { useVariable } from '../../../../common/storeSelectSpark';
import { useStore } from 'react-redux';
import { checkOperandError } from '@editor/aStore';

const styles = {
  main: css({
    boxSizing: 'border-box',
    width: '100%',
    height: '48px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ebebeb',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: '14px',
    color: '#000',

    '> p': {
      margin: 0,
      height: '100%',
      borderRadius: '4px',
      textAlign: 'center',
      paddingLeft: '8px',
      paddingRight: '8px',
      cursor: 'pointer',
    },
  }),
  val: css({
    flex: 1,
    width: 0,

    '> span': {
      display: 'inline-block',
      width: '100%',
      lineHeight: '38px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }),
  placeholder: css({
    color: '#999',
  }),
  operate: css({
    lineHeight: '38px',
    fontSize: '16px!important',
  }),
  options: css({
    width: '100%',
    height: '34px',
    border: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
    overflow: 'hidden',
    borderRadius: '4px',

    '> div': {
      flex: 1,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px!important',
    },
  }),
};

function Expression({
  options,
  render,
}: {
  options: Array<{ label: any; value: any; tooltip?: any; operator?: boolean; error?: boolean }>;
  render: (option: Partial<{ label: any; value: any; tooltip?: any; operator?: boolean }>) => React.ReactNode;
}) {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(options.find(opt => opt.operator && opt.value !== 'mode')?.value ?? '');
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', rowGap: 16 })}>
      <div className={styles.main}>
        {options.map(({ label, value, tooltip, operator, error }) => (
          <Tooltip key={value} title={tooltip ?? label} placement="top" mouseEnterDelay={0.5}>
            <p
              className={cx(
                operator ? styles.operate : styles.val,
                value === current &&
                  css({
                    color: token.colorPrimaryText,
                    background: token.colorBgContainer,
                    span: {
                      color: token.colorPrimaryText,
                    },
                  }),
                error &&
                  css({
                    color: token.colorErrorText,
                    span: {
                      color: token.colorErrorText,
                    },
                  })
              )}
              onClick={() => {
                setCurrent(current !== value ? value : undefined);
              }}
            >
              <span>{label}</span>
            </p>
          </Tooltip>
        ))}
      </div>
      {render(options.find(({ value }) => value === current) ?? {})}
    </div>
  );
}

export const expressionSpark = (
  value: any,
  onChange: any,
  keys: string[],
  operator: string,
  filterOperandType?: NonNullable<Parameters<typeof operandSpark>[2]> extends (options: infer T) => any
    ? (options: T, operator: string, key: string) => T
    : never
): Spark => {
  return {
    spark: 'element',
    content() {
      const store = useVariable();
      const { getState } = useStore();
      return (
        <Expression
          options={keys.map(key => {
            if (key === operator) {
              return { ...operatorSummary(value[key], key), value: key, operator: true };
            }
            return {
              value: key,
              label: <OperandSummary value={value[key] ?? 0} />,
              error: checkOperandError(value[key] ?? 0, getState().project) !== '',
            };
          })}
          render={({ value: key, operator: isOperator }) => {
            if (!key) {
              return null;
            }
            if (isOperator) {
              return render(
                operatorSpark(
                  value[key],
                  (operator: any, options: any) => onChange({ ...value, [key]: operator }, options),
                  key
                )
              );
            }
            return render(
              operandSpark(
                value[key] ?? 0,
                (operand: any, options: any) => {
                  if (key === 'from') {
                    if (
                      (operand.type !== 'store' || typeof store?.[operand.key] !== 'object') &&
                      (isArrayOperator(value[operator]) || isObjectOperator(value[operator]))
                    ) {
                      return onChange({ ...value, [key]: operand, [operator]: '=' }, options);
                    } else if (operand?.type === 'store' && operand.key) {
                      if (Array.isArray(store?.[operand.key])) {
                        return onChange({ ...value, [key]: operand, [operator]: 'array.insert', index: 0 }, options);
                      } else if (typeof store?.[operand.key] === 'object' && store?.[operand.key] !== null) {
                        return onChange({ ...value, [key]: operand, [operator]: 'object.update', index: 0 }, options);
                      }
                    }
                  }
                  onChange({ ...value, [key]: operand }, options);
                },
                filterOperandType && (options => filterOperandType(options, operator, key))
              )
            );
          }}
        />
      );
    },
  };
};

export const ExpressionSummary = ({
  expression,
  keys,
  operator: opKey,
  depth = 0,
}: {
  expression: any;
  keys: string[];
  operator: string;
  depth?: number;
}) => {
  const operator = expression[opKey];
  return (
    <>
      {keys.length > 1 && depth > 0 && '('}
      {keys.map((key, index) => {
        if (key === opKey) {
          return <Fragment key={key}>{operatorSummary(operator, opKey).label}</Fragment>;
        }
        return (
          !(['array.clear', 'object.clear'].includes(operator) && key === 'to') && (
            <Fragment key={key}>
              {index !== 0 && keys[keys.length - 1] === opKey && (operator === 'math.random' ? '到' : '与')}
              <OperandSummary key={key} value={expression[key] ?? 0} />
            </Fragment>
          )
        );
      })}
      {keys.length > 1 && depth > 0 && ')'}
    </>
  );
};
