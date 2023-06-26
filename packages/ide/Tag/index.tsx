import { getScriptTags } from '@webIde/api';
import { styles } from '@webIde/History';
import { createModel, getModel } from '@webIde/Ide/monacoUtils';
import { Button, Collapse, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { IdeState } from '..';
import { monaco } from 'react-monaco-editor';
import { switchTag } from '@webIde/store';
import { scriptTagServer, ScriptTagModal } from './ScriptTagModal';
import Icon from '@ant-design/icons';
import { TagOne } from '@icon-park/react';

const formatTime = (date: any) => {
  const month = date.getUTCMonth() + 1; //months from 1-12
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return year + '-' + month + '-' + day;
};

const Item = ({ data, onSelect, selectedTag }: any) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      style={{
        cursor: 'pointer',
        margin: '5px',
        padding: '0 4px',
        background: selectedTag?._id === data._id ? '#404238' : isHover ? 'gray' : 'unset',
        color: selectedTag?._id === data._id ? '#8496fb' : 'white',
      }}
      onClick={onSelect}
      onMouseOver={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      <span style={{ display: 'inline-block', width: '80px' }}>{formatTime(new Date(data.createAt))}</span>
      <Tooltip title={data.desc} color="#2db7f5" mouseEnterDelay={1}>
        <span style={{ marginLeft: '10px' }}>{data.tagName}</span>
      </Tooltip>
    </div>
  );
};

export default ({
  createDiffEditor,
}: {
  createDiffEditor: (source: monaco.editor.ITextModel, target: monaco.editor.ITextModel) => void;
}) => {
  const { dispatch } = useStore();
  const [list, setList] = useState<any[]>();

  const { selectedTag, projectId, currentTab, currentData } = useSelector((state: IdeState) => {
    const { workspace, tabs } = state.ide;
    return {
      selectedTag: workspace.selectedTag,
      projectId: workspace.projectId,
      currentTab: workspace.currentTab,
      currentData: workspace.resourceNav.map(id => tabs[id]).find(i => i.id === workspace.currentTab),
    };
  }, shallowEqual);

  const fetchData = useCallback(() => {
    if (projectId && currentTab) {
      getScriptTags(projectId, currentTab).then(({ data }: any) => {
        setList(data.data.reverse());
      });
    } else {
      setList([]);
    }
  }, [projectId, currentTab]);

  useEffect(fetchData, [fetchData]);

  const CollapseHeader = (
    <>
      <span style={{ marginRight: '5px' }}>标签</span>
      <Button
        style={{ color: 'white' }}
        type="text"
        size={'small'}
        icon={<Icon component={TagOne as any} />}
        onClick={e => {
          e.stopPropagation();
          scriptTagServer.showModal(currentData, fetchData);
        }}
      />
    </>
  );

  const onSelect = (data: any) => {
    const source = getModel(currentData?.name ?? '');
    const target = createModel(data.tagName, data.jscode, 'typescript');
    dispatch(switchTag(data));

    if (source && target) {
      createDiffEditor(source, target);
    }
  };

  return (
    <>
      <div style={{ color: 'white' }}>
        <Collapse bordered={false} className={styles.collapse}>
          <Collapse.Panel header={CollapseHeader} key="1">
            <div className={styles.listContainer}>
              {list?.map((item, idx) => {
                return (
                  <Item
                    data={item}
                    key={idx}
                    selectedTag={selectedTag}
                    onSelect={() => {
                      onSelect(item);
                    }}
                  />
                );
              })}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
      <ScriptTagModal />
    </>
  );
};
