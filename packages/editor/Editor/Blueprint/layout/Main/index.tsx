import { Alert } from 'antd';
import { css } from 'emotion';
import { memo, useMemo } from 'react';
import { useBPContext } from '../../hooks';
import { isRoot } from '../../types';
import { Ide } from './Ide/Editor';
import { PropsGroup } from './Property/getPropsGroup';
import { SignalsGroup } from './Property/getSignalsGroup';
import { theme } from 'antd';

const { useToken } = theme;
interface Props {
  theme: 'light' | 'dark';
}

export const MainProps = memo(({ theme }: Props) => {
  const props = useBPContext()!;
  const { token } = useToken();
  const { nodes } = props;
  const node = nodes.filter(node => node.selected)[0];

  return useMemo(() => {
    return (
      <div
        className={css({
          height: '100%',
          display: 'flex',
          position: 'absolute',
          right: 0,
          zIndex: 5,
          background: token.colorBgContainer,
        })}
      >
        <Alert.ErrorBoundary>
          <Ide theme={theme} />
        </Alert.ErrorBoundary>

        {node?.data && (
          <div
            className={css({
              width: 320,
              flexShrink: 0,
              borderLeft: `1px solid ${token.colorBorder}`,
              overflow: 'scroll',
            })}
          >
            <Alert.ErrorBoundary>
              {node.data.type === 'Blueprint' && !(!isRoot(node.type) && node.data.editor?.nodeType === 'component') ? (
                <SignalsGroup />
              ) : (
                <PropsGroup />
              )}
            </Alert.ErrorBoundary>
          </div>
        )}
      </div>
    );
  }, [node, theme]);
});
