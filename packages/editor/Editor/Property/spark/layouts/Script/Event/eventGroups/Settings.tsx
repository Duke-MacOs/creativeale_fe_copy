import { NULL_SPARK, Spark } from '@editor/Editor/Property/cells';
import { scriptSelectSpark } from '../../../../common/scriptSelectSpark';
import { SETTING_TYPE } from '../../../../constants';
import { ResourceBox } from '../../../groups/resourceSpark/ResourceBox';
import { IEventDesc, targetId_SPARK } from '../common';

export const Settings: IEventDesc = {
  name: '其他设置',
  category: '逻辑修改',
  checkRef({ targetId }, nodeIds) {
    return nodeIds.includes(targetId!);
  },
  checkError({ settingType, targetId, value }) {
    if (settingType === 0 && !value) return '未设置全局背景音乐';
    if (settingType === 2 || settingType === 3) {
      if (targetId === undefined) return '未设置目标节点';
      if (value === undefined) return '未设置动画或事件';
      return '';
    }
    return '';
  },
  Summary: ({ props }) => {
    const { settingType } = props;
    const label = SETTING_TYPE.find(item => item.value === settingType)?.label;
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return label ? <>{label}</> : null;
  },
  content: {
    spark: 'group',
    content: {
      spark: 'value',
      index: ['settingType', 'targetId', 'value', '_editor'],
      content([settingType, targetId, value, _editor = {}], onChange) {
        const { name, cover } = _editor;
        let content: Spark;
        switch (settingType) {
          case 0: {
            content = {
              spark: 'element',
              content() {
                return (
                  <ResourceBox
                    deletable
                    type="Sound"
                    url={value}
                    name={name || '背景音乐'}
                    cover={cover}
                    onChange={({ url, name, cover }) => {
                      onChange([settingType, targetId, url, { ..._editor, name, cover }]);
                    }}
                  />
                );
              },
            };
            break;
          }
          case 1: {
            content = {
              index: 'value',
              spark: 'slider',
              label: '音量',
              defaultValue: 1,
              tooltip: '音量',
              precision: 0,
              ratio: 100,
              unit: '%',
              step: 0.01,
              min: 0,
              max: 2,
            };
            break;
          }

          case 2:
          case 3: {
            content = {
              spark: 'grid',
              content: [
                targetId_SPARK,
                scriptSelectSpark(
                  { spark: 'select', index: 'value', width: 72, label: '动画/事件' },
                  {
                    targetId,
                    excludeTypes: ['Controller'],
                    returnScriptId: false,
                  }
                ),
              ],
            };
            break;
          }
          case 4: {
            content = { ...NULL_SPARK, hidden: true };
            break;
          }
          default:
            throw new Error('数据异常');
        }

        return {
          spark: 'grid',
          content: [
            {
              spark: 'element',
              content(render) {
                return render({
                  spark: 'select',
                  value: settingType,
                  label: '类型',
                  defaultValue: 0,
                  options: SETTING_TYPE,
                  tooltip: '类型',
                  onChange(settingType) {
                    onChange([settingType, undefined, undefined, undefined]);
                  },
                });
              },
            },
            content,
          ],
        };
      },
    },
  },
  extraProps: () => ({ settingType: 0 }),
};
