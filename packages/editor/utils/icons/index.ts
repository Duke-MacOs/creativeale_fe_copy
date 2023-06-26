import * as Icons from './export';
import Icon from '@ant-design/icons';

export { Icons };
export function iconOfScript(script: RikoScript): React.ComponentProps<typeof Icon>['component'] {
  switch (script.type) {
    case 'Effect': {
      return Icons['Effect'];
    }

    case 'Blueprint': {
      return Icons['Blueprint'] as React.ComponentProps<typeof Icon>['component'];
    }

    default: {
      if (script.props.script === 'CustomScript') {
        return Icons[(nameAlias(script.props.name!) || 'CustomScript') as keyof typeof Icons] as React.ComponentProps<
          typeof Icon
        >['component'];
      }
      return (Icons[script.props.script as keyof typeof Icons] ?? Icons['default']) as any;
    }
  }
}

function nameAlias(name: string) {
  switch (name) {
    case '鼠标控制': {
      return 'Mouse';
    }
    case '键盘控制': {
      return 'Keyboard';
    }
    case '延迟': {
      return 'Time';
    }
    case '设置颜色': {
      return 'Color';
    }
    case '定义开关': {
      return 'Boolean';
    }
    case '定义数值': {
      return 'Number';
    }
    case '计数器': {
      return 'Count';
    }
    case '数值判断': {
      return 'Compare';
    }
    case '计算数值': {
      return 'Compute';
    }
    case '任一启用': {
      return 'Or';
    }
    case '同时启用': {
      return 'And';
    }
    case '发送消息': {
      return 'EmitEvent';
    }
    case '监听消息': {
      return 'EventListener';
    }
    case '播放控制': {
      return 'Play';
    }
    case '显示或隐藏':
    case '显示与隐藏': {
      return 'Visible';
    }
  }
}
