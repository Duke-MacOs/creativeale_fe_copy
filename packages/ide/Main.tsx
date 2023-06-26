import { Layout } from 'antd';
import Ide from './Ide';
import Sidebar from './Sidebar';
import { useRestore } from './store';
import { css } from 'emotion';
import { shallowEqual, useSelector } from 'react-redux';
import { IdeState } from '.';
import { ExtraComponent } from './History';

const className = css({
  height: '100%',
  minWidth: 1080,
  overflowY: 'hidden',
});

const commonStyle = css({
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
});

export default function Main() {
  useRestore();
  const { selectedHistoryId, selectedTag } = useSelector((state: IdeState) => {
    return {
      selectedHistoryId: state.ide.workspace.selectedHistoryId,
      selectedTag: state.ide.workspace.selectedTag,
    };
  }, shallowEqual);

  return (
    <Layout className={className}>
      <Sidebar />
      <Layout style={{ position: 'relative', backgroundColor: '#272822' }}>
        <div
          id="diffContainer"
          className={commonStyle}
          style={{
            visibility: selectedHistoryId === null && selectedTag === null ? 'hidden' : 'unset',
          }}
        >
          <ExtraComponent />
        </div>
        <div
          className={commonStyle}
          style={{
            visibility: selectedHistoryId !== null || selectedTag !== null ? 'hidden' : 'unset',
          }}
        >
          <Ide />
        </div>
      </Layout>
    </Layout>
  );
}
