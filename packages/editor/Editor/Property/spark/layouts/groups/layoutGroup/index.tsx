import { IGroupSpark } from '../../../../cells';
import { layoutSpark } from './layoutSpark';
import type { SparkFn } from '../..';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export const layoutGroup: SparkFn = ({ type }, { scaleMode }): IGroupSpark => {
  return {
    spark: 'group',
    label: (
      <div>
        <span>布局适配</span>
        <Tooltip arrowPointAtCenter placement="bottomRight" title="使用教程">
          <QuestionCircleOutlined
            style={{ marginLeft: '4px' }}
            onClick={event => {
              event.stopPropagation();
              window.open(`https://magicplay.oceanengine.com/tutorials/primary/ten`);
            }}
          />
        </Tooltip>
      </div>
    ),
    hidden: type === 'Sound' || scaleMode !== 0,
    content: layoutSpark(),
  };
};
