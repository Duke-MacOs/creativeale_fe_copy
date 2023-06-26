interface IBase {
  name: string;
  description?: string;
  /**
   * 资源类型，目前只有蓝图脚本代码
   */
  type: string;
  /**
   * 资源内容，一般为JSON用来存储结构化数据，后端对data结构化数据内部内容无感知，前端根据使用需要可以自行加字段
   */
  data: Record<string, any>;
  /**
   * 资源分类
   */
  category?: string;
  /**
   * 是否为公共资源
   *
   * 0 - 非公共资源
   * 1 - 公共资源
   */
  isPublic?: number;
  // 附加信息
  extra?: any;
}

/**
 * 后续每新增一种动态资源类型，应该新写一个接口并通过联合类型关联
 */
export interface IDynamicResourceCode extends IBase {
  type: 'code';
  data: {
    code: string;
    contextType: '2d' | '3d' | 'both';
  };
}

export type DynamicResource = IDynamicResourceCode; // here，联合类型
export type Result<T extends DynamicResource['type'], U = DynamicResource> = (U extends { type: T } ? U : never) & {
  id: number;
  userId: number;
  teamId: number;
};
