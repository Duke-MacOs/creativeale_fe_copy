import Icon, { SwapOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, theme, Tooltip } from 'antd';
import { callValue, useRatioNumber } from '@editor/Editor/Property/cells';
import { useImbot } from '@editor/aStore';
import { useBoolean } from '@byted/hooks';
import { useEffect } from 'react';
import { css, cx } from 'emotion';
import SCRIPTS from '../Scripts/exports';
import { collectEvent, EventTypes } from '@editor/utils';
import { Icons } from '@editor/utils/icons';

const styles = {
  evt: css({
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
  }),
  main: css({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    border: '1px solid #EBEBEB',
    borderRadius: '4px',
    '> div': {
      height: '100%',
    },
  }),
  icon: css({
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',

    ' svg': {
      width: '28px',
      height: '28px',
      transformOrigin: '50% 50%',
    },
  }),
  info: css({
    flex: '1',
    width: 0,
    margin: '0 8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    rowGap: 2,

    '> :nth-child(1)': {
      margin: 0,
      padding: 0,
      height: '20px',
    },

    '> :nth-child(2)': {
      height: '16px',
    },
  }),
  name: css({
    marginBottom: '2px',

    '> input': {
      flex: 1,
      height: '100%',
      padding: 0,
      border: 'none',
      borderRadius: 0,
      color: '#333',
      fontWeight: 'bold',
      lineHeight: '17px',
      boxShadow: 'none!important',
    },

    '> input:hover': {
      boxShadow: 'none!important',
    },
  }),
  time: css({
    display: 'flex',

    '> span': {
      fontSize: '12px',
      color: '#999',
      marginRight: '7px',
    },

    ' .ant-input-number': {
      flex: 1,
      border: 'none',
      boxShadow: 'none',
    },

    ' .ant-input-number-handler-wrap': {
      display: 'none',
    },

    ' .ant-input-number-input-wrap': {
      height: '100%',
      fontSize: '0',

      '> input': {
        fontSize: '12px',
        color: '#999',
        height: '100%',
        lineHeight: '17px',
      },

      '> input:hover': {
        color: '#333',
      },
    },
  }),
  btns: css({
    display: 'flex',
    alignItems: 'center',

    '> *': {
      cursor: 'pointer',
    },

    '> * : hover': {
      color: '#3955f6',
    },
  }),
  list: css({
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    borderRadius: '4px',
    position: 'absolute',
    paddingTop: '2px',
    paddingBottom: '2px',
    zIndex: 120,
  }),
  item: css({
    width: '100%',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',

    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  }),
  itemIcon: css({
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',

    ' svg': {
      width: '18px',
      height: '18px',
      transformOrigin: '50% 50%',
    },
  }),
  itemName: css({
    fontSize: '14px',
    flex: '1',
    width: '0',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '4px',
    marginRight: '4px',

    '> *': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }),
};

interface IScriptSelect {
  script: string;
  name: string;
  time: number;
  onReplace: (script: string) => void;
  onChange: (partial: Partial<Pick<IScriptSelect, 'name' | 'time'>>) => void;
}

export const ScriptSelect = ({ script, name, time, onChange, onReplace }: IScriptSelect) => {
  const { state: optVisible, toggle, setFalse } = useBoolean(false);
  const { showImDialog } = useImbot();
  const OPTIONS = Object.entries(SCRIPTS).map(([key, value]) => ({
    value: key,
    label: value.name,
    tooltip: value.tooltip,
  }));

  useEffect(() => {
    const hideSelect = () => {
      if (optVisible) setFalse();
    };
    window.addEventListener('click', hideSelect);
    window.addEventListener('resize', hideSelect);
    return () => {
      window.removeEventListener('click', hideSelect);
      window.addEventListener('resize', hideSelect);
    };
  }, [optVisible, setFalse]);

  const { token } = theme.useToken();
  return (
    <div className={styles.evt}>
      <div className={styles.main}>
        <div
          className={cx(
            styles.icon,
            css({
              background: token.colorBgLayout,
            })
          )}
          onClick={e => {
            e.stopPropagation();
            toggle();
          }}
        >
          <Icon component={Icons[script as keyof typeof Icons] as any} />
        </div>
        <div className={styles.info}>
          <p className={styles.name}>
            <Input
              value={name}
              onChange={e =>
                onChange({
                  name: e.currentTarget.value,
                })
              }
            />
          </p>
          <div className={styles.time}>
            <span>开始时间</span>
            <InputNumber
              {...useRatioNumber({
                ratio: -1000,
                unit: 's',
                value: time,
                min: 0,
                precision: 2,
                step: 10,
                onChange(timeOrFn) {
                  onChange({ time: callValue(timeOrFn as any, time) });
                },
              })}
            />
          </div>
        </div>
        <div className={styles.btns}>
          <Tooltip title={'更换'} placement="bottom">
            <Button
              type="text"
              size="large"
              icon={<SwapOutlined />}
              style={{ backgroundColor: token.colorBgLayout, borderRadius: 0, height: '100%' }}
              onClick={e => {
                e.stopPropagation();
                toggle();
              }}
            />
          </Tooltip>
        </div>
      </div>
      {optVisible && (
        <div
          className={cx(
            styles.list,
            css({
              background: token.colorBgContainer,
            })
          )}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {OPTIONS.map((opt, index) => (
            <div
              className={styles.item}
              key={index}
              onClick={() => {
                collectEvent(EventTypes.UserSelectEventTrigger, {
                  name: opt.label,
                });
                onReplace(opt.value);
                setFalse();
              }}
            >
              <div className={styles.itemIcon}>
                <Icon component={Icons[opt.value as keyof typeof Icons] as any} />
              </div>
              <div className={styles.itemName}>
                <span>{opt.label}</span>
                {opt.tooltip}
              </div>
            </div>
          ))}
          <Button
            type="link"
            style={{ display: 'block', marginLeft: 'auto', padding: 0 }}
            onClick={e => {
              e.preventDefault();
              showImDialog('互动方式');
            }}
          >
            如何使用互动方式？
          </Button>
        </div>
      )}
    </div>
  );
};
