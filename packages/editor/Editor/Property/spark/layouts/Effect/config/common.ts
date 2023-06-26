import { distanceGroup } from '../groups/distanceGroup';
import { anchorGroup } from '../groups/anchorGroup';
import { scaleGroup, offsetScaleGroup, destScaleGroup } from '../groups/scaleGroup';
import { angleGroup, offsetAngleGroup, destAngleGroup } from '../groups/angleGroup';
import { alphaGroup } from '../groups/alphaGroup';
import { positionGroup, offsetPosGroup, destPosGroup } from '../groups/positionGroup';
import { sizeGroup } from '../groups/sizeGroup';
import { brightGroup } from '../groups/brightGroup';
import { axisGroup } from '../groups/axisGroup';
import { flipGroup } from '../groups/flipGroup';

export default {
  AlphaTo: {
    groups: [alphaGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      alpha: {
        defaultValue: 0,
      },
    },
  },
  Move: {
    groups: [distanceGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  MoveTo: {
    groups: [positionGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  RotateTo: {
    groups: [anchorGroup, angleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      presetAnchor: {
        hidden: false,
      },
      startAngle: {
        hidden: true,
      },
      rotateRange: {
        hidden: true,
      },
      rotation: {
        hidden: false,
      },
    },
  },
  Scale: {
    groups: [anchorGroup, scaleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      presetAnchor: {
        hidden: false,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        hidden: true,
      },
      scaleRangeX: {
        hidden: false,
      },
      scaleRangeY: {
        hidden: false,
      },
    },
  },
  ScaleTo: {
    groups: [anchorGroup, scaleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
      presetAnchor: {
        hidden: false,
      },
      startScale: {
        hidden: true,
      },
      scaleRange: {
        hidden: true,
      },
      scaleX: {
        hidden: false,
      },
      scaleY: {
        hidden: false,
      },
    },
  },
  SizeTo: {
    groups: [sizeGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Path: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Typing: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  CountDown: {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Brightness: {
    groups: [brightGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Contrast: {
    groups: [brightGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Saturation: {
    groups: [brightGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Anchor: {
    groups: [axisGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Flip: {
    groups: [flipGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Move3D: {
    groups: [offsetPosGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  MoveTo3D: {
    groups: [destPosGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Rotate3D: {
    groups: [offsetAngleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  RotateTo3D: {
    groups: [destAngleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  Scale3D: {
    groups: [offsetScaleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
  ScaleTo3D: {
    groups: [destScaleGroup],
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  },
};
