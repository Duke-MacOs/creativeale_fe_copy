import { distanceGroup } from '../groups/distanceGroup';
import { anchorGroup } from '../groups/anchorGroup';
import { scaleGroup } from '../groups/scaleGroup';
import { angleGroup } from '../groups/angleGroup';
import { inclineGroup } from '../groups/inclineGroup';

export default {
  ImmediateIO: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  FadeIO: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Toast: {},
  MoveIO: {
    groups: [distanceGroup],
  },
  ScaleIO: {
    groups: [anchorGroup],
  },
  SmallIO: {
    groups: [scaleGroup],
    specialConfig: {
      scaleRange: {
        hidden: true,
      },
    },
  },
  RotateIO: {
    groups: [anchorGroup, angleGroup],
  },
  TurnIO: {
    groups: [anchorGroup, angleGroup],
    specialConfig: {
      rotateRange: {
        hidden: true,
      },
    },
  },
  RotateScaleIO: {
    groups: [anchorGroup, angleGroup],
    specialConfig: {
      startAngle: {
        defaultValue: -180,
      },
      rotateRange: {
        defaultValue: 540,
      },
    },
  },
  SkewIO: {
    groups: [anchorGroup, inclineGroup],
  },
  RotateMoveIO: {
    groups: [anchorGroup, distanceGroup, angleGroup],
    specialConfig: {
      startAngle: {
        defaultValue: -180,
      },
      rotateRange: {
        defaultValue: 540,
      },
    },
  },
  TurnSmallIO: {
    groups: [anchorGroup, scaleGroup, angleGroup],
    specialConfig: {
      startScale: {
        defaultValue: 1.5,
      },
      rotateRange: {
        hidden: true,
      },
      scaleRange: {
        hidden: true,
      },
    },
  },
  TurnScaleIO: {
    groups: [anchorGroup, angleGroup],
    specialConfig: {
      startAngle: {
        defaultValue: 30,
      },
      rotateRange: {
        hidden: true,
      },
    },
  },
  RotateSmallIO: {
    groups: [anchorGroup, scaleGroup, angleGroup],
    specialConfig: {
      startAngle: {
        defaultValue: -180,
      },
      rotateRange: {
        defaultValue: 540,
      },
      scaleRange: {
        hidden: true,
      },
      startScale: {
        defaultValue: 2,
      },
    },
  },
  RotateBlurIO: {
    groups: [anchorGroup, angleGroup],
  },
  RotateDropIO: {
    groups: [anchorGroup, distanceGroup, angleGroup],
    specialConfig: {
      ease: {
        hidden: true,
      },
      distanceX: {
        hidden: true,
      },
    },
  },
};
