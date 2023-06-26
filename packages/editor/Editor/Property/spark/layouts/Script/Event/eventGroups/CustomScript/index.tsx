import { CellContext } from '@editor/Editor/Property/cells';
import { useContext } from 'react';
import { customGroups } from '../../../../groups/customGroups';
import { IEventDesc } from '../../common';
import { CustomScriptUpload, mergeCustomProps } from './CustomScriptUpload';
import { highlight } from '../../common/highlight';
import { useStore } from 'react-redux';
import { getCustomScriptByOrderId } from '@editor/utils';
import { withoutFileSuffix } from '@editor/Editor/Blueprint/utils/fileSuffix';
import { PropsConfig } from '@editor/Editor/Property/spark/common/CompPropsConfig';
import { useHasFeature } from '@shared/userInfo';

export const CustomScript: IEventDesc = {
  name: '自定义脚本',
  category: '高级',
  link: 'https://magicplay.oceanengine.com/tutorials/senior/three',
  checkError({ url, jsCode }) {
    if (!url && !jsCode) return '请上传或创建脚本';
    return '';
  },
  Summary: ({ props: { url, jsCode, _editor: { name = '' } = {} as any } }) => {
    const { getState } = useStore<EditorState, EditorAction>();
    if (url && typeof url === 'number') {
      try {
        const scene = getCustomScriptByOrderId(getState().project, url);
        const label =
          withoutFileSuffix(scene.name) === withoutFileSuffix(name) ? name : `${name}(脚本名：${scene.name})`;
        return <> {label ? highlight(label) : '点击查看脚本'}</>;
      } catch {
        return <>点击查看脚本</>;
      }
    }

    if (jsCode) {
      return <>点击查看脚本</>;
    }

    return <>请上传或创建脚本</>;
  },
  content: {
    spark: 'value',
    index: 'props',
    content(props, onChange) {
      const { blueprint } = useContext(CellContext);
      const allFeature = useHasFeature();

      return {
        spark: 'grid',
        content: [
          {
            spark: 'group',
            hidden: blueprint?.enabled,
            content: {
              spark: 'element',
              content() {
                return (
                  <CustomScriptUpload
                    props={props}
                    onChange={(props: any) => {
                      onChange(props);
                    }}
                  />
                );
              },
            },
          },
          {
            spark: 'element',
            hidden: !props.url || !allFeature,
            content() {
              return (
                <PropsConfig
                  value={Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('$'))) as any}
                  onChange={newProps =>
                    onChange({
                      ...props,
                      ...mergeCustomProps(
                        newProps,
                        Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('$'))) as any
                      ),
                    })
                  }
                />
              );
            },
          },
          {
            spark: 'grid',
            content: customGroups(
              {
                callee: 'Riko.useObject',
                default: Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('$'))),
                name: '自定义属性',
              },
              (k, v, options) => {
                onChange({ ...props, [k]: v }, options);
              }
            ),
          },
        ],
      };
    },
  },
  extraProps: () => ({
    url: undefined,
  }),
};
