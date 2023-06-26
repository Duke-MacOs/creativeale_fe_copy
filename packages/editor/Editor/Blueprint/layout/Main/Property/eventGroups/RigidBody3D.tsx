import { colliderGroup } from '@editor/Editor/Property/spark/layouts/3D/MeshSprite3D/colliderGroup';
import { physicsGroup } from '@editor/Editor/Property/spark/layouts/3D/MeshSprite3D/physicsGroup';
import { IEventDesc } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { delay } from '@editor/Editor/Property/spark/layouts/Script/Event/common/highlight';

export const RigidBody3D: IEventDesc = {
  name: '启用3D物理',
  category: '高级',
  content: {
    spark: 'grid',
    content: [
      (physicsGroup as any)(),
      {
        spark: 'check',
        index: 'physics',
        check: {
          hidden: physics => ['none', undefined].includes(physics?.type),
        },
        content: colliderGroup({} as any, {} as any),
      },
    ],
  },
  checkRef({ joints = [] }, nodeIds) {
    return (joints as any).some(({ otherNodeId }: { otherNodeId: number }) => nodeIds.includes(otherNodeId));
  },
  Summary: ({ props: { time } }) => {
    return <>{delay(time)} 启用元素3D物理属性</>;
  },
};
