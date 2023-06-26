import { IOption } from '@riko-prop/interface';
import { css } from 'emotion';

export const SideMenu = ({
  onItemClick,
  currentValue,
}: {
  onItemClick: (group: IOption) => void;
  currentValue: any;
}) => {
  return (
    <div style={{ flex: '0 0 111px', padding: '8px 0', borderRight: '1px solid #F4F4F4' }}>
      {EASE_BEZIER_LIST.map((group, idx) => {
        return (
          <div
            key={group.value || idx}
            className={css(
              {
                padding: '6px 6px 6px 16px',
                fontSize: '14px',
                lineHeight: '20px',
                cursor: 'default',
              },
              currentValue === group.value
                ? { backgroundColor: '#EEF3FE', color: '#3955F6' }
                : {
                    '&:hover': {
                      color: '#333',
                    },
                  }
            )}
            onClick={() => onItemClick(group)}
          >
            {group.label}
            {group.reserved?.enLabel && <span>({group.reserved.enLabel})</span>}
          </div>
        );
      })}
    </div>
  );
};

export const EASE_BEZIER_LIST: IOption[] = [
  { label: '默认', value: undefined },
  { label: '自定义', value: 'custom' },
  { label: '线性', value: 'linearNone', reserved: { enLabel: 'Linear' } },
  {
    label: '缓动',
    value: 'cubic',
    reserved: { enLabel: 'Ease' },
    children: [
      { label: '进出', value: 'cubicInOut' },
      { label: '进入', value: 'cubicIn' },
      { label: '退出', value: 'cubicOut' },
    ],
  },
  {
    label: '弹性',
    value: 'elastic',
    reserved: { enLabel: 'Spring' },
    children: [
      { label: '在前', value: 'elasticIn' },
      { label: '在后', value: 'elasticOut' },
      { label: '双边', value: 'elasticInOut' },
    ],
  },
  {
    label: '弹跳',
    value: 'bounce',
    reserved: { enLabel: 'Bounce' },
    children: [
      { label: '在前', value: 'bounceIn' },
      { label: '在后', value: 'bounceOut' },
      { label: '双边', value: 'bounceInOut' },
    ],
  },
  {
    label: '惯性',
    value: 'back',
    reserved: { enLabel: 'Back' },
    children: [
      { label: '在前', value: 'backIn' },
      { label: '在后', value: 'backOut' },
      { label: '双边', value: 'backInOut' },
    ],
  },
];
