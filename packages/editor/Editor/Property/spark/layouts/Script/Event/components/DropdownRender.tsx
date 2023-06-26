import { QuestionCircleOutlined } from '@ant-design/icons';
import { sparkValue } from '@editor/Editor/Property/cells';
import { Dropdown, Space, theme, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { useBoolean } from '@byted/hooks';
import { useEditor, useImbot } from '@editor/aStore';
import { IScriptData } from '@byted/riko';
import { newID } from '@editor/utils';
import { amIHere } from '@shared/utils';
import { EVENTS, IEventDesc } from '..';
import { css } from 'emotion';
import React from 'react';

export function DropdownRender({
  children,
  onSelect,
  context,
  ...rest
}: Partial<typeof Dropdown> & {
  children: React.ReactNode;
  onSelect: (script: IScriptData) => void;
  context?: 'useEvent' | 'Script';
}) {
  const { state: visible, toggle, setFalse } = useBoolean(false);
  return (
    <Dropdown
      overlay={<EventOptions onSelect={onSelect} onClose={setFalse} context={context} />}
      trigger={['click']}
      placement="bottomLeft"
      open={visible}
      onOpenChange={toggle}
      {...rest}
    >
      {children}
    </Dropdown>
  );
}

function EventOptions({
  onSelect,
  onClose,
  context = 'Script',
}: {
  onSelect(script: IScriptData): void;
  onClose(): void;
  context?: 'useEvent' | 'Script';
}) {
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const { showImDialog } = useImbot();
  const typeOfPlay = useSelector<EditorState>(({ project }) => project.settings.typeOfPlay);
  const optionsRecord = Object.entries(EVENTS)
    .filter(([key]: any) => {
      switch (key) {
        case 'CustomScript':
          return context !== 'useEvent';
        case 'PlayableComponentEvent':
          return amIHere({ release: false }) && typeOfPlay === 2;
        default:
          return true;
      }
    })
    .reduce(
      (acc, [value, item]) => {
        if (item.category) {
          acc[item.category] = (acc[item.category] || []).concat({ value, item });
        }
        return acc;
      },
      {
        常用: [],
        播放控制: [],
        逻辑修改: [],
        辅助操作: [],
        高级: [],
      } as Record<string, Array<{ item: IEventDesc; value: string }>>
    );
  const { token } = theme.useToken();

  return (
    <div
      className={css({
        boxShadow: 'rgb(240 241 242) 0px 2px 8px',
        background: token.colorBgContainer,
        width: 283,
        zIndex: 99999,
        borderRadius: 4,
      })}
    >
      <div
        className={css({
          maxHeight: 520,
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',

          '& > div:nth-child(3)': {
            borderLeft: '1px solid rgb(235, 235, 235)',
            borderRight: '1px solid rgb(235, 235, 235)',
          },
          '& > div:nth-child(4)': {
            borderLeft: '1px solid rgb(235, 235, 235)',
          },
          '& > div:nth-child(5)': {
            borderLeft: '1px solid rgb(235, 235, 235)',
          },
        })}
      >
        {Object.entries(optionsRecord).map(([category, options]) => {
          return (
            <div
              key={category}
              className={css({
                padding: '2px 0',
              })}
            >
              <div
                key={category}
                className={css({ padding: '4px 0 4px 16px', fontSize: 12, color: 'rgb(153, 153, 153)' })}
              >
                {category}
              </div>
              {options.map(({ value, item: { name, label = name, link, content, extraProps } }) => (
                <div
                  key={value}
                  className={css({
                    padding: '4px 0 4px 16px',
                    cursor: 'pointer',
                    '&:hover': { background: 'rgb(235, 235, 235)' },
                  })}
                  onClick={() => {
                    const props = content ? sparkValue(content) : {};
                    const newId = newID();
                    onSelect({
                      id: newId,
                      type: value === 'Effect' ? 'Effect' : 'Script',
                      editor: {},
                      props: {
                        name: EVENTS[value as keyof typeof EVENTS].name,
                        script: value === 'Effect' ? 'AlphaTo' : value === 'ModifyProperty' ? 'ModifyData' : value,
                        ...props,
                        ...(extraProps?.({ enableBlueprint }) || {}),
                      },
                    });
                    onClose();
                  }}
                >
                  <Space>
                    {label}
                    {typeof link === 'string' && (
                      <Tooltip title="使用教程">
                        <QuestionCircleOutlined
                          onClick={e => {
                            e.stopPropagation();
                            if (link) {
                              window.open(link);
                            } else {
                              showImDialog(name);
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Space>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div
        className={css({
          borderTop: '1px solid rgb(235, 235, 235)',
          textAlign: 'right',
          padding: '2px 10px',
          textDecorationLine: 'underline',
        })}
      >
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            showImDialog('触发方式');
          }}
        >
          如何使用触发方式?
        </a>
      </div>
    </div>
  );
}
