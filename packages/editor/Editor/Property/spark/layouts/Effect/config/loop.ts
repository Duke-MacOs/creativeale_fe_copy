import { distanceGroup } from '../groups/distanceGroup';
import { anchorGroup } from '../groups/anchorGroup';
import { scaleGroup } from '../groups/scaleGroup';
import { angleGroup } from '../groups/angleGroup';
import { amplitudeGroup, amplitudeVectorGroup } from '../groups/amplitudeGroup';
import { offsetPosGroup } from '../groups/positionGroup';

export default {
  Breathe: {
    groups: [anchorGroup, scaleGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.1,
      },
    },
  },
  Heartbeat: {
    groups: [anchorGroup, scaleGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.2,
      },
    },
  },
  Pulse: {
    groups: [anchorGroup, scaleGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.15,
      },
    },
  },
  Wave: {
    groups: [scaleGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.5,
        min: -1,
        max: 10,
      },
    },
  },
  Float: {
    groups: [distanceGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  GoAndBack: {
    groups: [distanceGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      stayTime: {
        hidden: false,
      },
    },
  },
  Jelly: {
    groups: [amplitudeGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  Bounce: {
    groups: [distanceGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  Rotate: {
    groups: [anchorGroup, angleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      startAngle: {
        hidden: true,
      },
      presetAnchor: {
        hidden: false,
      },
    },
  },
  Swing: {
    groups: [angleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
      startAngle: {
        hidden: true,
      },
      rotateRange: {
        defaultValue: 15,
      },
    },
  },
  Twinkle: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  Flash: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  Jolty: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  Shake: {
    groups: [anchorGroup, distanceGroup, angleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      startAngle: {
        hidden: true,
      },
      rotateRange: {
        defaultValue: 10,
      },
    },
  },
  Vibrate: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      ease: {
        hidden: true,
      },
    },
  },
  RotateScale: {
    groups: [scaleGroup, angleGroup],
    specialConfig: {
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.5,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startAngle: {
        hidden: true,
      },
    },
  },
  ShakeScale: {
    groups: [scaleGroup, angleGroup],
    specialConfig: {
      startScale: {
        hidden: true,
      },
      scaleRange: {
        defaultValue: 0.2,
      },
      hasFadeEffect: {
        hidden: true,
      },
      startAngle: {
        hidden: true,
      },
      rotateRange: {
        defaultValue: 5,
      },
    },
  },
  // 3D
  Breathe3D: {
    groups: [scaleGroup],
    specialConfig: {
      startScale: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Heartbeat3D: {
    groups: [scaleGroup],
    specialConfig: {
      startScale: {
        hidden: true,
      },
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Float3D: {
    groups: [offsetPosGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Jelly3D: {
    groups: [amplitudeVectorGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
};
