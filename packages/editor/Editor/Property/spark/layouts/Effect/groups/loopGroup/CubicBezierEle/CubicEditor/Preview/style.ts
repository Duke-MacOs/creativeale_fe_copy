import { css, keyframes } from 'emotion';

// svg 的宽度设置为容器的宽度后等比缩放得到的高度
export const SVG_SCALE_HEIGHT = 114.91;
export const PADDING = [25, 5, 25, 5];
export const BORDER_WIDTH = 1;

export default {
  main: css({
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '8px',
    height: '8px',
    zIndex: 10,
    background: '#7dc757',
    opacity: 0,
    transitionProperty: 'opacity, transform',
    transitionDelay: '0s, 0.4s',
    transitionDuration: '0.3s, 0.6s',
    animationDelay: '0.4s',
    animationDuration: '1s',
    animationFillMode: 'both',
  }),
  top: css({
    position: 'absolute',
    top: 0,
    left: 0,
    border: '4px solid transparent',
    borderRightColor: '#7dc757',
    transform: 'translateX(-100%)',
  }),
  animate: css({
    opacity: 1,
  }),
  cubicInOut: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
  }),
  cubicIn: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.32, 0, 0.67, 0)',
  }),
  cubicOut: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.61, 1, 0.88, 1)',
  }),
  backInOut: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  }),
  backIn: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  }),
  backOut: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }),
  linearNone: css({
    transform: `translateY(-${SVG_SCALE_HEIGHT}px)`,
    transitionTimingFunction: 'linear',
  }),
  elasticIn: css({
    animationName: keyframes`
      0% {
        transform: translateY(0);
      }
    
      4% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0004}px);
      }
    
      8% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0016}px);
      }
    
      14% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0017}px);
      }
    
      18% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.0004}px);
      }
    
      26% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.0058}px);
      }
    
      28% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.0055}px);
      }
    
      40% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0156}px);
      }
    
      42% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0164}px);
      }
    
      56% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.0463}px);
      }
    
      58% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.044}px);
      }
    
      72% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.1312}px);
      }
    
      86% {
        transform: translateY(${SVG_SCALE_HEIGHT * 0.3706}px);
      }
    
      100% {
        transform: translateY(-${SVG_SCALE_HEIGHT}px);
      }
    }`,
  }),
  elasticOut: css({
    animationName: keyframes`
    0% {
      transform: translateY(0);
    }
  
    16% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.3227}px);
    }
  
    28% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.8688}px);
    }
  
    44% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.0463}px);
    }
  
    59% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.9836}px);
    }
  
    73% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.0058}px);
    }
  
    88% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.998}px);
    }
  
    100% {
      transform: translateY(-${SVG_SCALE_HEIGHT}px);
    }`,
  }),
  elasticInOut: css({
    animationName: keyframes`
    0% {
      transform: translateY(0);
    }

    4% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.0008}px);
    }

    8% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.001}px);
    }

    18% {
      transform: translateY(${SVG_SCALE_HEIGHT * 0.0052}px);
    }

    20% {
      transform: translateY(${SVG_SCALE_HEIGHT * 0.0039}px);
    }

    28% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.0235}px);
    }

    30% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.0239}px);
    }

    38% {
      transform: translateY(${SVG_SCALE_HEIGHT * 0.0927}px);
    }

    40% {
      transform: translateY(${SVG_SCALE_HEIGHT * 0.1175}px);
    }

    60% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.1175}px);
    }

    62% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.0927}px);
    }

    70% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.9761}px);
    }

    72% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.9765}px);
    }

    80% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.0039}px);
    }

    82% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 1.0052}px);
    }

    90% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.9997}px);
    }

    92% {
      transform: translateY(-${SVG_SCALE_HEIGHT * 0.999}px);
    }

    100% {
      transform: translateY(-${SVG_SCALE_HEIGHT}px);
    }
  `,
  }),
  bounceIn: css({
    animationName: keyframes`
      0% {
        transform: translateY(0);
      }
    
      4% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0154}px);
      }
    
      8% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0066}px);
      }
    
      18% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0625}px);
      }
    
      26% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0163}px);
      }
    
      46% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.2498}px);
      }
    
      64% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0199}px);
      }
    
      76% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.5644}px);
      }
    
      88% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.8911}px);
      }
    
      100% {
        transform: translateY(-${SVG_SCALE_HEIGHT}px);
      }
    `,
  }),
  bounceOut: css({
    animationName: keyframes`
      0% {
        transform: translateY(0);
      }
      12% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.1089}px);
      }
    
      24% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.4356}px);
      }
    
      36% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9801}px);
      }
    
      54% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.7502}px);
      }
    
      74% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9837}px);
      }
    
      82% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9375}px);
      }
    
      92% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9934}px);
      }
    
      96% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9846}px);
      }
    
      100% {
        transform: translateY(-${SVG_SCALE_HEIGHT}px);
      }
    `,
  }),
  bounceInOut: css({
    animationName: keyframes`
      0% {
        transform: translateY(0);
      }
    
      2% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0077}px);
      }
    
      4% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0033}px);
      }
    
      10% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.03}px);
      }
    
      14% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.0098}px);
      }
    
      22% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.1242}px);
      }
    
      32% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.01}px);
      }
    
      42% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.4032}px);
      }
    
      50% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.5}px);
      }
    
      58% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.5968}px);
      }
    
      68% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9901}px);
      }
    
      78% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.8758}px);
      }
    
      86% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9902}px);
      }
    
      90% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.97}px);
      }
    
      96% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9967}px);
      }
    
      98% {
        transform: translateY(-${SVG_SCALE_HEIGHT * 0.9923}px);
      }
    
      100% {
        transform: translateY(-${SVG_SCALE_HEIGHT}px);
      }   
    `,
  }),
};
