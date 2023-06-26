export type AnyFn = (...args: any[]) => any;

// 获取类型对象中的数据字段组成新的类型对象
export type MemberOf<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends AnyFn ? never : K;
  }[keyof T]
>;

// 获取类型对象中的函数字段组成新的类型对象
export type MethodOf<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends AnyFn ? K : never;
  }[keyof T]
>;
