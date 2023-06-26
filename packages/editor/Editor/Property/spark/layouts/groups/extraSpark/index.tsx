import type { SparkFn } from '../..';
import render, { CellContext, Spark, TooltipHelp } from '../../../../cells';
import { alignAction } from '@editor/aStore';
import { useDispatch } from 'react-redux';
import { Button, Tooltip } from 'antd';
import alignments from './alignments';
import Icon from '@ant-design/icons';
import { useContext } from 'react';
import { css, cx } from 'emotion';

const CLASS_NAME = css({
  alignItems: 'center',
  whiteSpace: 'nowrap',
  display: 'flex',
});

const Alignments = ({ className }: any) => {
  const dispatch = useDispatch();
  return (
    <div className={cx(CLASS_NAME, className)}>
      {alignments.map(({ icon, tooltip, value }) => (
        <Tooltip key={value} title={tooltip}>
          <Button
            type="text"
            size="small"
            icon={
              <Icon
                component={icon as any}
                onClick={() => {
                  dispatch(alignAction(value));
                }}
              />
            }
          />
        </Tooltip>
      ))}
    </div>
  );
};

export const OpenKeysEnabled = ({ className }: any) => {
  const {
    openKeys: { enabled, setEnabled },
  } = useContext(CellContext);
  return (
    <div className={cx(CLASS_NAME, className)}>
      <TooltipHelp placement="left" title="开启此按钮后，可以定义素材属性是否允许用户更改" />
      素材可被编辑&nbsp;
      {render({
        spark: 'element',
        content: render =>
          render({
            spark: 'boolean',
            value: enabled!,
            onChange: setEnabled as any,
            type: 'switch',
            size: 'small',
          }),
      })}
    </div>
  );
};

export const extraSpark: SparkFn = ({ type }, { isRoot, propsMode }): Spark => {
  const hidden =
    isRoot || propsMode === 'Product' || ((type === 'Sound' || type === 'Script') && propsMode !== 'Template');
  return {
    spark: 'value',
    index: '_alignment_and_enable_openKeys',
    hidden,
    content: () => ({
      spark: 'element',
      content() {
        switch (propsMode) {
          case 'Project':
            return (
              <Alignments
                className={css({
                  padding: '16px 16px 0',
                  button: {
                    flex: 'auto',
                  },
                })}
              />
            );
          case 'Template':
            return <OpenKeysEnabled className={css({ height: 40, padding: '16px 16px 0' })} />;
          default:
            return null;
        }
      },
    }),
  };
};
