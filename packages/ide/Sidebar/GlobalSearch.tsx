import React, { useState } from 'react';
import { Input, Tree } from 'antd';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useDebounceFn, usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IdeState } from '@webIde/index';
import { switchTab } from '@webIde/store';
import { getModel } from '@webIde/Ide/monacoUtils';
import { loadModel } from '@webIde/Ide/hooks/useResource';
import { isNumber, isString } from 'lodash';

const styles = {
  inputWrapper: css({
    padding: '8px',
  }),
  input: css({
    width: '100%',
    backgroundColor: '#3e3e3e !important',
    borderRadius: 0,
    borderColor: 'transparent',
    fontSize: '14px',
    color: '#ccc',
  }),
  resultList: css({
    color: '#fff',
    '& .ant-tree': {
      background: 'none !important',
      color: '#ddd',
    },
    '& .ant-tree-list': {
      '& .ant-tree-treenode': {
        width: '100% !important',
        userSelect: 'none',
        '&:hover': {
          backgroundColor: '#404238',
        },
      },
    },
    '& .ant-tree-treenode-motion': {
      width: '100% !important',
      overflow: 'hidden !important',
    },
    '& .ant-tree-node-content-wrapper': {
      width: '100%',
      overflow: 'hidden !important',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    '& .ant-tree-indent-unit': {
      width: '0',
    },
    '& .ant-tree-title': {
      display: 'block',
      fontSize: '14px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  }),
  count: css({
    padding: '4px 8px',
    color: '#ccc',
    fontSize: '12px',
  }),
};

type ISearchResult = {
  key: number | string;
  title: string;
  children?: ISearchResult[];
};

export function GlobalSearch({ visible }: { visible: boolean }) {
  const dispatch = useDispatch();
  const { resourceNav } = useSelector((state: IdeState) => {
    const { workspace, tabs } = state.ide;
    return { resourceNav: workspace.resourceNav.map(id => tabs[id]) };
  }, shallowEqual);
  const [searchResult, setSearchResult] = useState<ISearchResult[]>([]);
  const [expandKeys, setExpandKeys] = useState<Array<string | number>>([]);
  const [keyword, setKeyword] = useState('');
  const [matchesCount, setMatchesCount] = useState(0);

  const { run: findAllMatches } = useDebounceFn(() => {
    if (!visible || !keyword) return;
    const result: ISearchResult[] = [];
    const tasks = [];
    let matchesCount = 0;
    for (const tab of resourceNav) {
      tasks.push(
        loadModel(tab).then(() => {
          const model = getModel(tab.name);
          if (model) {
            const matches = model.findMatches(keyword, false, false, false, null, true);
            if (matches.length) {
              result.push({ key: tab.id, title: tab.name, children: [] });

              for (const match of matches) {
                matchesCount++;
                const children = result[result.length - 1].children;
                if (children) {
                  const range = match.range;
                  const lineContent = model.getLineContent(range.startLineNumber);
                  const lineStartColumn = range.startColumn < 28 ? 1 : range.startColumn - 28;
                  children.push({
                    key: String(tab.id) + '-' + JSON.stringify(range),
                    title: window.filterXSS(
                      lineContent.slice(lineStartColumn - 1, range.startColumn - 1) +
                        '<span style="background-color: rgba(224,96,40,0.44)">' +
                        lineContent.slice(range.startColumn - 1, range.endColumn - 1) +
                        '</span>' +
                        lineContent.slice(range.endColumn - 1),
                      {
                        onIgnoreTagAttr(tag: string, name: string, value: string) {
                          if (tag && ['style', 'class'].indexOf(name) > -1) {
                            return `${name}="${value}"`;
                          }
                        },
                      }
                    ),
                  });
                }
              }
            }
          }
        })
      );
    }
    Promise.all(tasks).then(() => {
      setSearchResult(result);
      setMatchesCount(matchesCount);
      setExpandKeys(result.map(res => res.key));
    });
  });

  const handleInputChange = usePersistCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setKeyword(val);
    findAllMatches();
  });

  return (
    <div style={{ display: visible ? 'block' : 'none' }}>
      <div className={styles.inputWrapper}>
        <Input className={styles.input} value={keyword} placeholder="搜索" onChange={handleInputChange} />
      </div>
      {keyword && (
        <div className={styles.count}>
          {searchResult.length}文件中有{matchesCount}个结果
        </div>
      )}
      <div className={styles.resultList}>
        <Tree
          showIcon
          expandedKeys={expandKeys}
          selectedKeys={[]}
          selectable={true}
          treeData={searchResult}
          titleRender={nodeData => {
            return <span dangerouslySetInnerHTML={{ __html: nodeData.title as string }} />;
          }}
          onSelect={selectKey => {
            const key = selectKey[0];
            if (isNumber(key)) {
              setExpandKeys(keys => {
                keys = [...keys];
                const idx = keys.indexOf(key);
                if (idx >= 0) {
                  keys.splice(idx, 1);
                } else {
                  keys.push(key);
                }
                return keys;
              });
            }
            if (isString(key)) {
              const splitKey = key.split('-');
              dispatch(switchTab(Number(splitKey[0]), JSON.parse(splitKey[1])));
            }
          }}
        />
      </div>
    </div>
  );
}
