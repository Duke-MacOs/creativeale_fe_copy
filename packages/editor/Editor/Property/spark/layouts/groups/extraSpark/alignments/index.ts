import { AlignMode } from '@byted/riko';

import { ReactComponent as LeftAlignment } from './left-alignment.svg';
import { ReactComponent as HorizontalCenter } from './horizontal-center.svg';
import { ReactComponent as RightAlignment } from './right-alignment.svg';
import { ReactComponent as TopAlignment } from './top-alignment.svg';
import { ReactComponent as VerticalCenter } from './vertical-center.svg';
import { ReactComponent as BottomAlignment } from './bottom-alignment.svg';
import { ReactComponent as DistributeHorizontally } from './distribute-horizontally.svg';
import { ReactComponent as DistributeVertically } from './distribute-vertically.svg';

export default [
  {
    icon: LeftAlignment,
    tooltip: '左对齐',
    value: AlignMode.Left,
  },
  {
    icon: HorizontalCenter,
    tooltip: '水平居中',
    value: AlignMode.Center,
  },
  {
    icon: RightAlignment,
    tooltip: '右对齐',
    value: AlignMode.Right,
  },
  {
    icon: TopAlignment,
    tooltip: '顶对齐',
    value: AlignMode.Top,
  },
  {
    icon: VerticalCenter,
    tooltip: '垂直居中',
    value: AlignMode.Middle,
  },
  {
    icon: BottomAlignment,
    tooltip: '底对齐',
    value: AlignMode.Bottom,
  },
  {
    icon: DistributeHorizontally,
    tooltip: '水平等间距',
    value: AlignMode.Horizontal,
  },
  {
    icon: DistributeVertically,
    tooltip: '垂直等间距',
    value: AlignMode.Vertical,
  },
];
