import render, { INumberSpark, IStringSpark, Spark, SparkValue, TreeModal } from '@editor/Editor/Property/cells';
import { operandSpark, OperandSummary } from '../layouts/Script/Event/components/operand';
import { Button, Tooltip, Typography } from 'antd';
import { Formula } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { useState } from 'react';
import { css } from 'emotion';
import { useEditor } from '@editor/aStore';

export const formulaSpark = (spark: INumberSpark | IStringSpark): Spark => {
  const { index, label, defaultValue } = spark;
  return {
    spark: 'value',
    index,
    content(value = defaultValue, onChange) {
      const [visible, setVisible] = useState(false);
      const { enableBlueprint } = useEditor(0, 'enableBlueprint');

      const computed = value?.type;
      return {
        spark: 'flex',
        columnGap: 4,
        alignItems: 'start',
        content: [
          computed
            ? {
                spark: 'element',
                content: () => {
                  const summary = <OperandSummary value={value} />;
                  return (
                    <Button
                      block
                      onClick={() => setVisible(!visible)}
                      className={css({ display: 'flex', padding: '0 8px', alignItems: 'center', textAlign: 'left' })}
                    >
                      <div className={css({ flex: '0 0 64px' })}>
                        <Typography.Text type="secondary">{label}</Typography.Text>
                      </div>
                      <div className={css({ flex: 'auto', overflow: 'hidden' })}>
                        <Tooltip title={summary}>
                          <span>{summary}</span>
                        </Tooltip>
                      </div>
                    </Button>
                  );
                },
              }
            : ({
                spark: 'element',
                content: render => render({ ...spark, value, onChange } as SparkValue),
              } as Spark),
          {
            spark: 'element',
            basis: 'auto',
            content: () => (
              <>
                <Tooltip title="使用动态数据">
                  <Button
                    type={computed ? 'primary' : 'default'}
                    icon={<Icon component={Formula as any} />}
                    onClick={() => {
                      if (computed) {
                        onChange(value._editor?.value ?? defaultValue);
                      } else {
                        setVisible(true);
                      }
                    }}
                  />
                </Tooltip>
                {visible && (
                  <TreeModal
                    title={
                      <>
                        <Icon component={Formula as any} /> {label}
                      </>
                    }
                    children={render({
                      spark: 'group',
                      content: operandSpark(
                        value,
                        (newValue, options) =>
                          onChange(
                            newValue?.type
                              ? { _editor: { value: value?._editor ? value._editor?.value : value }, ...newValue }
                              : newValue,
                            options
                          ),
                        options => (enableBlueprint ? options : options.filter(({ value }) => value !== 'scene'))
                      ),
                    })}
                    onCancel={() => setVisible(false)}
                  />
                )}
              </>
            ),
          },
        ],
      };
    },
  };
};
