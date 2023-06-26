import { memo, useRef, useState } from 'react';
import { Button, Input, message, Modal, Select, Space } from 'antd';
import { useSelector, useStore } from 'react-redux';
import { classnest, newID, openKeysToCompProps, popPlayState } from '../../../utils';
import { IOption } from '@/riko-prop/interface';
import TipsPopup from '@editor/common/TipsPopup';
import className from '../style';
import { amIHere } from '@shared/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Delete, Edit } from '@icon-park/react';
import { RefSelectProps } from 'antd/lib/select';
import { changeEditor, restoreState, deleteState, useProject, useEditor, addState } from '@editor/aStore';
import { debounce, isEqual } from 'lodash';
import { css } from 'emotion';

const { Option } = Select;

export const usePropsMode = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const propsMode = useSelector(({ project: { editor } }: EditorState) => editor.propsMode);
  return {
    propsMode,
    onChange(propsMode: EditorState['project']['editor']['propsMode']) {
      const project = popPlayState(getState().project);
      const path = `/play/${propsMode.toLowerCase()}/${location.pathname.split('/').pop()}${location.search}`;
      history.replaceState(undefined, '', path);
      if (propsMode === 'Product') {
        return dispatch(
          restoreState({
            ...project,
            editor: {
              ...project.editor,
              sceneMode: propsMode,
              settingsOn: false,
              propsMode,
            },
            scenes: project.scenes.map(scene => (scene.type === 'Scene' ? openKeysToCompProps(scene) : scene)),
          })
        );
      }
      return dispatch(changeEditor(0, { propsMode, sceneMode: propsMode }));
    },
  };
};

/**
 * 切换互动组件状态
 */
const ToggleState = () => {
  const { dispatch } = useStore<EditorState>();
  const { state: stateArr = [], onChange: onChangeState } = useEditor('state');
  const { stateId, onChange: onChangeStateId } = useEditor('stateId');
  const [editingStateId, setEditingStateId] = useState<number | null>(null);
  const [status, setStatus] = useState<'add' | 'edit' | 'blank'>('blank');
  const [name, setName] = useState('');
  const ref = useRef<RefSelectProps>(null);
  const statusMap = {
    add: '新增',
    edit: '编辑',
    blank: '',
  };

  const onSubmit = () => {
    if (name.trim().length) {
      if (stateArr.some(state => state.name === name.trim())) {
        return message.error('组件状态名重复');
      }
      if (status === 'add') {
        const stateId = newID();
        dispatch(addState(name, stateId));
        onChangeStateId(stateId);
        setName('');
        setStatus('blank');
        message.success('状态新增成功');
      } else {
        onChangeState(
          stateArr.map(state => {
            if (state.id === editingStateId) {
              return { ...state, name };
            }
            return state;
          })
        );
        setName('');
        setStatus('blank');
        message.success('状态名修改成功');
      }
    } else {
      message.warning('请输入状态名');
    }
  };

  return (
    <Space>
      <Select
        ref={ref}
        value={stateId ?? -1}
        style={{ width: 126, marginLeft: 10 }}
        placeholder="互动组件状态"
        optionLabelProp="label"
        onChange={value => {
          onChangeStateId(value > 0 ? value : undefined);
          ref.current?.blur();
        }}
      >
        <Option key={-1} value={-1} label="默认状态">
          默认状态
        </Option>
        {stateArr.map(state => {
          return (
            <Option value={state.id} label={state.name} key={state.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    marginRight: 'auto',
                    maxWidth: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {state.name}
                </div>
                <Space>
                  <Edit
                    theme="outline"
                    size="14"
                    fill="#333"
                    strokeWidth={2}
                    onClick={e => {
                      e.stopPropagation();
                      setEditingStateId(state.id);
                      setStatus('edit');
                      setName(state.name);
                    }}
                  />
                  <Delete
                    theme="outline"
                    size="14"
                    fill="#333"
                    strokeWidth={2}
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(deleteState(state.id));
                    }}
                  />
                </Space>
              </div>
            </Option>
          );
        })}
      </Select>
      <Button
        icon={<PlusOutlined />}
        onClick={() => {
          setStatus('add');
        }}
      />
      <Modal
        open={status !== 'blank'}
        title={`${statusMap[status]}状态名`}
        okText={statusMap[status]}
        cancelText="取消"
        destroyOnClose
        onCancel={() => {
          setStatus('blank');
          setName('');
        }}
        onOk={onSubmit}
      >
        <Input
          autoFocus
          width={120}
          placeholder="请输入新的状态名"
          value={name}
          onChange={e => {
            setName(e.currentTarget.value);
          }}
          onPressEnter={debounce(onSubmit, 200)}
        />
      </Modal>
    </Space>
  );
};

const SceneModeSelect = ({ disabled = false, options }: { disabled?: boolean; options: IOption[] }) => {
  const { propsMode, onChange } = usePropsMode();
  const type = useProject('type');
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');

  return (
    <div className={classnest({ [`${className}-content`]: 4 })}>
      <Space
        className={css({
          pointerEvents: 'auto',
        })}
      >
        <TipsPopup
          title="切换模式"
          content="在“编辑作品模式”下，您可以正常编辑作品；切换为“定义模板模式”后，您可以将该作品定义为模板，供他人使用。"
          visibleKey="_sceneModeEnable"
        >
          <Select value={propsMode} disabled={disabled} options={options} onChange={onChange} />
        </TipsPopup>
        {type === 'Component' && !enableBlueprint && amIHere({ release: false }) && <ToggleState />}
      </Space>
    </div>
  );
};

export default memo(SceneModeSelect, isEqual);
