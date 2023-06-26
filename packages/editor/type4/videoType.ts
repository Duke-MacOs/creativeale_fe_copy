import { ISceneState } from '@editor/aStore';

export const enum VideoType {
  Invalid = -1,
  Unused,
  Start,
  Normal,
  Loop,
  End,
}

export const isLoopVideoType = (props: ISceneState['props']) => {
  return Object.values(props).reduce((c, { jumpSceneId }) => c + Number(typeof jumpSceneId === 'number'), 0) > 1;
};

export const videoTypeName = (type: VideoType): string => {
  switch (type) {
    case VideoType.Start:
      return '开始';
    case VideoType.Normal:
      return '普通';
    case VideoType.Loop:
      return '循环';
    case VideoType.End:
      return '结束';
    case VideoType.Unused:
      return '未用';
    case VideoType.Invalid:
      return '无效';
  }
};

export const videoType = (orderId: number, scenes: ISceneState[]) => {
  const scene = scenes.find(scene => scene.orderId === orderId);
  if (!scene) {
    return VideoType.Invalid; // 无效 orderId
  }
  const referring = Object.values(scene.props).some(({ jumpSceneId }) =>
    scenes.find(({ orderId }) => orderId === jumpSceneId)
  );
  const referred = scenes.some(({ props }) =>
    Object.values(props).some(({ jumpSceneId }) => jumpSceneId === scene.orderId)
  );
  if (referred && isLoopVideoType(scene.props)) {
    return VideoType.Loop;
  }
  if (referring && referred) {
    return VideoType.Normal; // 普通视频
  } else if (referring) {
    return VideoType.Start; // 开始视频
  } else if (referred) {
    return VideoType.End; // 结束视频
  } else {
    return VideoType.Unused; // 未用视频
  }
};

export const videoLayer = (scenes: ISceneState[]) => {
  const visit = (parents: ISceneState[], layers: Record<number, string> = {}, depth = 1): typeof layers => {
    if (!parents.length) {
      return layers;
    }
    const children: ISceneState[] = [];
    parents.forEach((parent, index) => {
      if (parents.length > 1) {
        layers[parent.orderId] = `${depth}.${index + 1}`;
      } else {
        layers[parent.orderId] = `${depth}`;
      }
      Object.values(parent.props).forEach(({ jumpSceneId }) => {
        const child = scenes.find(({ orderId }) => orderId === jumpSceneId);
        if (child) {
          children.push(child);
        }
      });
    });
    return visit(
      children.filter(({ orderId }) => !layers[orderId]),
      layers,
      depth + 1
    );
  };
  return visit(scenes.filter(({ orderId }) => videoType(orderId, scenes) === VideoType.Start));
};
