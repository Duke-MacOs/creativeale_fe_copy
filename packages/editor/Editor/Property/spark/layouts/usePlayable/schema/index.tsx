import type { Spark } from '../../../../cells';
import { GuideTip } from '@editor/views';
import { Typography } from 'antd';
import videoList from './videoList';
import { css } from 'emotion';

export const PlayableSettings: Spark = {
  spark: 'grid',
  content: [
    {
      spark: 'group',
      label: (
        <GuideTip
          id="straight.playable.settings"
          head="加载页模板化配置"
          placement="leftTop"
          className={css({
            '.ant-tooltip-content': {
              transform: 'translateX(-36px)',
            },
          })}
          body={
            <div>
              加载页包含互动素材专属标识、主副标题、加载页视频几部分内部，配置有吸引力的内容能在互动素材加载阶段留住用户，为互动素材争取更多转化可能性。
            </div>
          }
        >
          背景视频上传（至多5个）
        </GuideTip>
      ),
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'element',
            content: () => (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                背景视频会与图标、主副文案组合成多个加载动画物料，投放时会随机更换加载动画，以使直出素材感知更丰富
              </Typography.Text>
            ),
          },
          videoList,
        ],
      },
    },
    {
      spark: 'group',
      label: '主标题填写',
      content: {
        spark: 'string',
        index: 'title',
        placeholder: '请输入加载页主标题文案，14个字以内',
        max: 14,
      },
    },
    {
      spark: 'group',
      label: '副标题填写',
      content: {
        spark: 'string',
        index: 'subTitle',
        placeholder: '请输入加载页副标题文案，12个字以内',
        max: 12,
      },
    },
    {
      spark: 'group',
      label: '加载图标',
      content: {
        spark: 'select',
        index: 'icon',
        label: '选择',
        options: [
          { label: '图标1', value: 'material/preview/cb756a09718208edd5dee49e80f1ed7c/sequence.json' },
          { label: '图标2', value: 'material/preview/e6079c7c05f93532a3e1b87dc7f541da/sequence.json' },
          { label: '图标3', value: 'material/preview/92427d37c42f1ecad4e85d70f995bb9f/sequence.json' },
          { label: '图标4', value: 'material/preview/821616ef37d20268c7d0a3ee0d16cf22/sequence.json' },
        ],
      },
    },
  ],
};
