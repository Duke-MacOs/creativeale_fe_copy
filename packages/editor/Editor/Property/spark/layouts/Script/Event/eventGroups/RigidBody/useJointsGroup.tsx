import { getIndexer, Spark } from '@editor/Editor/Property/cells';
import { JOINT_TYPE } from '@editor/Editor/Property/spark/constants';
import { NodeCell } from '../../../../groups/customGroups/NodeCell';
import { formulaSpark } from '../../../../../common/formulaSpark';

export const type_SPARK: Spark = {
  spark: 'select',
  index: 'type',
  defaultValue: 'distance',
  options: JOINT_TYPE,
  label: '类型',
  tooltip: '关节类型',
};

export const otherNodeId_SPARK: Spark = {
  spark: 'value',
  index: 'otherNodeId',
  content(value, onChange) {
    return {
      spark: 'element',
      content: () => (
        <NodeCell
          includeSelf={false}
          value={value || 0}
          onChange={onChange}
          label="连接关节的节点"
          tooltip="连接关节的另一个节点"
        />
      ),
    };
  },
};

export const otherAnchorX_SPARK: Spark = {
  index: 'otherAnchorX',
  spark: 'number',
  label: '另一刚体的锚点X',
  defaultValue: 0,
  tooltip: '连接关节的另一刚体的锚点X距离左上角的偏移量',
};
export const otherAnchorXSpark = formulaSpark(otherAnchorX_SPARK);

export const otherAnchorY_SPARK: Spark = {
  index: 'otherAnchorY',
  spark: 'number',
  label: '另一刚体的锚点Y',
  defaultValue: 0,
  tooltip: '连接关节的另一刚体的锚点Y距离左上角的偏移量',
};
export const otherAnchorYSpark = formulaSpark(otherAnchorY_SPARK);

export const selfAnchorX_SPARK: Spark = {
  index: 'selfAnchorX',
  spark: 'number',
  label: '自身刚体锚点X',
  defaultValue: 0,
  tooltip: '自身节点的刚体锚点X距离左上角的偏移量',
};
export const selfAnchorXSpark = formulaSpark(selfAnchorX_SPARK);

export const selfAnchorY_SPARK: Spark = {
  index: 'selfAnchorY',
  spark: 'number',
  label: '自身刚体锚点Y',
  defaultValue: 0,
  tooltip: '自身节点的刚体锚点Y距离左上角的偏移量',
};
export const selfAnchorYSpark = formulaSpark(selfAnchorY_SPARK);

export const frequency_SPARK: Spark = {
  index: 'frequency',
  spark: 'number',
  label: '弹性系数',
  defaultValue: 1,
  tooltip: '弹簧系统的震动频率，可以视为弹簧的弹性系数',
  min: 0,
};
export const frequencySpark = formulaSpark(frequency_SPARK);

export const damping_SPARK: Spark = {
  index: 'damping',
  spark: 'number',
  label: '刚体阻尼',
  defaultValue: 0,
  tooltip: '刚体在回归到节点过程中受到的阻尼，建议取值0~1',
  min: 0,
  max: 10,
};
export const dampingSpark = formulaSpark(damping_SPARK);

export const minLength_SPARK: Spark = {
  index: 'minLength',
  spark: 'number',
  label: '最小距离',
  defaultValue: -1,
  tooltip: '自身刚体与另一刚体的最小距离',
  min: -1,
};
export const minLengthSpark = formulaSpark(minLength_SPARK);

export const maxLength_SPARK: Spark = {
  index: 'maxLength',
  spark: 'number',
  label: '最大距离',
  defaultValue: -1,
  tooltip: '自身刚体与另一刚体的最大距离',
  min: -1,
};
export const maxLengthSpark = formulaSpark(maxLength_SPARK);

export const jointLength_SPARK: Spark = {
  index: 'jointLength',
  spark: 'number',
  label: '静止长度',
  defaultValue: 0,
  tooltip: '约束目标的静止长度',
  min: 0,
};
export const jointLengthSpark = formulaSpark(jointLength_SPARK);

export const collideConnected_SPARK: Spark = {
  spark: 'label',
  label: '是否可碰撞',
  tooltip: '两个刚体是否可以发生碰撞',
  content: {
    spark: 'boolean',
    index: 'collideConnected',
    defaultValue: false,
  },
};

export const axisX_SPARK: Spark = {
  spark: 'number',
  index: 'axisX',
  defaultValue: 1,
  label: '运动方向X',
  tooltip: '运动方向X,比如1,0是沿X轴向右',
};
export const axisXSpark = formulaSpark(axisX_SPARK);

export const axisY_SPARK: Spark = {
  spark: 'number',
  index: 'axisY',
  defaultValue: 0,
  label: '运动方向Y',
  tooltip: '运动方向Y,比如0,1是沿y轴向上',
};
export const axisYSpark = formulaSpark(axisY_SPARK);

export const enableMotor_SPARK: Spark = {
  spark: 'label',
  label: '开启马达',
  tooltip: '是否开启马达，开启马达可使目标刚体运动',
  content: {
    spark: 'boolean',
    index: 'enableMotor',
    defaultValue: false,
  },
};

export const motorSpeed_SPARK: Spark = {
  spark: 'number',
  index: 'motorSpeed',
  defaultValue: 0,
  label: '马达最大速度',
  tooltip: '启用马达后，在axis轴上移动可以达到的最大速度或者最大旋转速度',
};
export const motorSpeedSpark = formulaSpark(motorSpeed_SPARK);

export const maxMotorForce_SPARK: Spark = {
  spark: 'number',
  index: 'maxMotorForce',
  defaultValue: 10000,
  label: '马达最大作用力',
  tooltip: '启用马达后，可以施加的最大作用力',
};
export const maxMotorForceSpark = formulaSpark(maxMotorForce_SPARK);

export const enableLimit_SPARK: Spark = {
  spark: 'label',
  label: '开启约束范围',
  tooltip: '是否对刚体的移动或旋转范围加以约束',
  content: {
    spark: 'boolean',
    index: 'enableLimit',
    defaultValue: false,
  },
};

export const lowerTranslation_Spark: Spark = {
  spark: 'number',
  index: 'lowerTranslation',
  defaultValue: 0,
  label: '刚体移动下限',
  tooltip: '启用约束后，刚体移动范围的下限，是距离anchor的偏移量',
};

export const upperTranslation_SPARK: Spark = {
  spark: 'number',
  index: 'upperTranslation',
  defaultValue: 0,
  label: '刚体移动上限',
  tooltip: '启用约束后，刚体移动范围的上限，是距离anchor的偏移量',
};

export const firstNodeId_SPARK: Spark = {
  spark: 'select',
  index: 'firstNodeId',
  defaultValue: undefined,
  label: '第一个节点',
  //   options: 'NODE_OPTIONS,
  options: [], //
  tooltip: '连接关节的第一个节点，必须要有RevoluteJoint或者PrismaticJoint',
};

export const secondNodeId_SPARK: Spark = {
  spark: 'select',
  index: 'secondNodeId',
  label: '第二个节点',
  //   options: 'NODE_OPTIONS,
  options: [], //
  tooltip: '连接关节的第二个节点，必须要有RevoluteJoint或者PrismaticJoint',
};

export const radio_SPARK: Spark = {
  spark: 'number',
  index: 'ratio',
  defaultValue: 1,
  label: '速度比例',
  tooltip: '两个齿轮角速度比例或者移动距离比例',
};
export const radioSpark = formulaSpark(radio_SPARK);

export const linearOffsetX_SPARK: Spark = {
  spark: 'number',
  index: 'linearOffsetX',
  defaultValue: 0,
  label: 'X偏移',
  tooltip: 'X偏移量',
};
export const linearOffsetXSpark = formulaSpark(linearOffsetX_SPARK);

export const linearOffsetY_SPARK: Spark = {
  spark: 'number',
  index: 'linearOffsetY',
  defaultValue: 0,
  label: 'Y偏移',
  tooltip: 'Y偏移量',
};
export const linearOffsetYSpark = formulaSpark(linearOffsetY_SPARK);

export const angularOffset_SPARK: Spark = {
  spark: 'number',
  index: 'angularOffset',
  defaultValue: 0,
  label: '角度偏移',
  tooltip: '角度偏移',
};
export const angularOffsetSpark = formulaSpark(angularOffset_SPARK);

export const maxForce_SPARK: Spark = {
  spark: 'number',
  index: 'maxForce',
  defaultValue: 1000,
  label: '最大作用力',
  tooltip: '最大作用力',
};
export const maxForceSpark = formulaSpark(maxForce_SPARK);

export const maxTorque_SPARK: Spark = {
  spark: 'number',
  index: 'maxTorque',
  defaultValue: 1000,
  label: '最大扭力',
  tooltip: '最大扭力',
};
export const maxTorqueSpark = formulaSpark(maxTorque_SPARK);

export const correctionFactor_SPARK: Spark = {
  spark: 'number',
  index: 'correctionFactor',
  defaultValue: 0.3,
  label: '缓动因子',
  step: 0.1,
  tooltip: '缓动因子',
  max: 1,
};
export const correctionFactorSpark = formulaSpark(correctionFactor_SPARK);

export const lowerAngle_SPARK: Spark = {
  spark: 'number',
  index: 'lowerAngle',
  defaultValue: 0,
  label: '刚体旋转角度下限',
  tooltip: '启用约束后，刚体旋转范围的下限角度',
};
export const upperAngle_SPARK: Spark = {
  spark: 'number',
  index: 'upperAngle',
  defaultValue: 0,
  label: '刚体旋转角度上限',
  tooltip: '启用约束后，刚体旋转范围的上限角度',
};

export const ratio_SPARK: Spark = {
  spark: 'number',
  index: 'ratio',
  defaultValue: 1,
  label: '速度比例',
  tooltip: '两个齿轮角速度比例或者移动距离比例',
};
export const ratioSpark = formulaSpark(ratio_SPARK);

export const selfGroundPointX_SPARK: Spark = {
  spark: 'number',
  index: 'selfGroundPointX',
  defaultValue: 0,
  label: '滑轮与自身位置偏移X',
  tooltip: '滑轮上与节点selfAnchor相连接的节点，是相对于自身刚体的左上角位置偏移X',
};
export const selfGroundPointXSpark = formulaSpark(selfGroundPointX_SPARK);

export const selfGroundPointY_SPARK: Spark = {
  spark: 'number',
  index: 'selfGroundPointY',
  defaultValue: 0,
  label: '滑轮与自身位置偏移Y',
  tooltip: '滑轮上与节点selfAnchor相连接的节点，是相对于自身刚体的左上角位置偏移Y',
};
export const selfGroundPointYSpark = formulaSpark(selfGroundPointY_SPARK);

export const otherGroundPointX_SPARK: Spark = {
  spark: 'number',
  index: 'otherGroundPointX',
  defaultValue: 0,
  label: '滑轮与其他位置偏移X',
  tooltip: '滑轮上与节点otherAnchor相连接的节点，是相对于otherBody的左上角位置偏移X',
};
export const otherGroundPointXSpark = formulaSpark(otherGroundPointX_SPARK);

export const otherGroundPointY_SPARK: Spark = {
  spark: 'number',
  index: 'otherGroundPointY',
  defaultValue: 0,
  label: '滑轮与其他位置偏移Y',
  tooltip: '滑轮上与节点otherAnchor相连接的节点，是相对于otherBody的左上角位置偏移Y',
};
export const otherGroundPointYSpark = formulaSpark(otherGroundPointY_SPARK);

export function useJointsGroup(item: any, onChange: any): Spark {
  let sparks: Spark[] = [];
  switch (item.type) {
    case 'distance':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        {
          spark: 'flex',
          content: [otherAnchorXSpark, otherAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [frequencySpark, dampingSpark],
        },
        {
          spark: 'flex',
          content: [minLengthSpark, maxLengthSpark],
        },
        jointLengthSpark,
        collideConnected_SPARK,
      ];
      break;
    case 'prismatic':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [axisXSpark, axisYSpark],
        },
        enableMotor_SPARK,
        {
          spark: 'check',
          index: 'enableMotor',
          check: {
            hidden: value => !value,
          },
          content: {
            spark: 'flex',
            content: [motorSpeed_SPARK, maxMotorForce_SPARK],
          },
        },
        enableLimit_SPARK,
        {
          spark: 'check',
          index: 'enableLimit',
          check: {
            hidden: value => !value,
          },
          content: {
            spark: 'flex',
            content: [lowerTranslation_Spark, upperTranslation_SPARK],
          },
        },
        collideConnected_SPARK,
      ];
      break;
    case 'revolute':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        { spark: 'flex', content: [selfAnchorX_SPARK, selfAnchorY_SPARK] },
        enableMotor_SPARK,
        {
          spark: 'check',
          index: 'enableMotor',
          check: { hidden: value => !value },
          content: {
            spark: 'flex',
            content: [motorSpeed_SPARK, maxMotorForce_SPARK],
          },
        },
        enableLimit_SPARK,
        {
          spark: 'check',
          index: 'enableLimit',
          check: { hidden: value => !value },
          content: {
            spark: 'flex',
            content: [lowerAngle_SPARK, upperAngle_SPARK],
          },
        },
        collideConnected_SPARK,
      ];
      break;
    case 'gear':
      sparks = [type_SPARK, firstNodeId_SPARK, secondNodeId_SPARK, collideConnected_SPARK, ratioSpark];
      break;
    case 'motor':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        { spark: 'flex', content: [linearOffsetXSpark, linearOffsetYSpark] },
        {
          spark: 'flex',
          content: [angularOffsetSpark, maxForceSpark],
        },
        {
          spark: 'flex',
          content: [maxTorqueSpark, correctionFactorSpark],
        },
        collideConnected_SPARK,
      ];
      break;
    case 'wheel':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [axisXSpark, axisYSpark],
        },
        enableMotor_SPARK,
        {
          spark: 'check',
          index: 'enableMotor',
          check: {
            hidden: value => !value,
          },
          content: {
            spark: 'flex',
            content: [motorSpeedSpark, maxMotorForceSpark],
          },
        },
        frequencySpark,
        dampingSpark,
        collideConnected_SPARK,
      ];
      break;

    case 'pulley':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [otherAnchorXSpark, otherAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [selfGroundPointXSpark, selfGroundPointYSpark],
        },
        {
          spark: 'flex',
          content: [otherGroundPointXSpark, otherGroundPointYSpark],
        },
        ratioSpark,
        collideConnected_SPARK,
      ];
      break;
    case 'weld':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        { spark: 'flex', content: [selfAnchorXSpark, selfAnchorYSpark] },
        {
          spark: 'flex',
          content: [frequencySpark, dampingSpark],
        },
        collideConnected_SPARK,
      ];
      break;
    case 'rope':
      sparks = [
        type_SPARK,
        otherNodeId_SPARK,
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [otherAnchorXSpark, otherAnchorYSpark],
        },
        maxLengthSpark,
        collideConnected_SPARK,
      ];
      break;
    case 'mouse':
      sparks = [
        type_SPARK,
        {
          spark: 'flex',
          content: [selfAnchorXSpark, selfAnchorYSpark],
        },
        {
          spark: 'flex',
          content: [maxForceSpark, frequencySpark],
        },
        dampingSpark,
      ];
      break;
    default:
      throw new Error('数据异常');
  }
  return {
    spark: 'context',
    content: {
      spark: 'grid',
      content: sparks,
    },
    provide: () => ({
      useValue: getUseValue(item, onChange),
    }),
  };
}

function getUseValue(item: any, onChange: any) {
  return (index: any) => {
    const { indexValue, indexEntries } = getIndexer(index);
    return {
      value: [indexValue(item)],
      onChange([value]: any[]) {
        onChange(Object.fromEntries(indexEntries(value)));
      },
    };
  };
}
