import { Breadcrumb, Button, Tag, theme } from 'antd';
import Icon from '@ant-design/icons';
import { Dot } from '@icon-park/react';
import { shallowEqual, useSelector } from 'react-redux';
import { ICaseState } from '@editor/aStore';
import { isVRCase } from '@editor/Template/Panorama/utils';

interface IProps {
  changed: boolean;
  readOnly: boolean;
  onReturn: (level?: number) => void;
}

export default ({ changed, readOnly, onReturn }: IProps) => {
  const { token } = theme.useToken();
  const list = useSelector(({ project }: EditorState) => {
    return Array.from(collect(project)).reverse();

    function* collect(state: ICaseState): Generator<string> {
      yield state.type === 'PanoramaData' ? (isVRCase(project) ? '' : '全景空间') : state?.scenes[0].name ?? '未命名';
      if (state.editor.prevState) {
        yield* collect(state.editor.prevState);
      }
    }
  }, shallowEqual).filter(i => i !== '');

  return (
    <div style={{ zIndex: 99, marginLeft: '10px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <Breadcrumb separator=">" style={{ marginRight: '10px' }}>
        {list.map((name, idx) => (
          <Breadcrumb.Item
            key={idx}
            onClick={() => {
              const level = list.length - 1 - idx;
              if (level > 0) onReturn(level);
            }}
          >
            {idx === 0 ? (
              <Button type="primary" size="small">
                返回项目
              </Button>
            ) : (
              name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      {changed && <Icon component={Dot as any} style={{ color: token.colorPrimary }} />}
      {readOnly && <Tag color={token.colorPrimary}>只读</Tag>}
    </div>
  );
};
