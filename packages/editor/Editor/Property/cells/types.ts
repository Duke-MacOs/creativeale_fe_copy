import { Radio } from 'antd';
import React, { ComponentProps } from 'react';

type Key = string | number;

type GetSparkValue<S extends Spark> = S extends IBaseSpark<infer V, Index>
  ? Omit<S, 'index'> & { value?: V; onChange: OnChange<V | ((v: V) => V)> }
  : never;

export type Index = Key | string[] | number[];
export type Value<I extends Index> = I extends any[] ? any[] : any;
export type OpenKeys = Array<Key | [Key, OpenKeys]>;
export type OnChange<V = any> = (
  value: V,
  options?: { before?: boolean; after?: boolean; replace?: boolean; ids?: number[] }
) => void;
export type UseValue<V = any, O = V> = { value: V; onChange: OnChange<O> };
export type SparkProps<S extends Spark> = S extends { content: any }
  ? S & { render(spark: Spark): JSX.Element | null }
  : S extends { defaultValue?: infer V }
  ? Omit<S, 'index' | 'spark'> & Partial<UseValue<V, V | ((v: V) => V)>>
  : S;

export type Spark =
  | IBooleanSpark
  | IContextSpark
  | INumberSpark
  | ISliderSpark
  | ISelectSpark
  | IRadioGroupSpark
  | IEnterSpark
  | IStringSpark
  | IDateRangeSpark
  | IElementSpark
  | ICheckSpark
  | IVisitSpark
  | IValueSpark
  | IGridSpark
  | IFlexSpark
  | IColorSpark
  | IGroupSpark
  | IBlockSpark
  | ILabelSpark
  | never;

export type SparkValue = Exclude<GetSparkValue<Spark>, { spark: 'enter' | 'visit' | 'check' | 'value' }>;
export interface IContextSpark extends ISparkFlags {
  spark: 'context';
  content: Spark;
  provide: (context: IContext) => Partial<IContext>;
}

export interface IVisitSpark extends ISparkFlags {
  spark: 'visit';
  content: Spark;
  index: Key;
  label: React.ReactNode;
  extra?: Spark;
  fallback?: (onVisit: () => void) => Spark;
}
export interface IGroupSpark extends ISparkFlags {
  spark: 'group';
  content: Spark;
  tooltip?: React.ReactNode;
  label?: React.ReactNode;
  extra?: Spark;
  defaultActive?: boolean;
}

export interface IGridSpark<I extends Index = Index> extends ISparkFlags {
  spark: 'grid';
  columns?: number;
  columnGap?: number;
  rowGap?: number;
  content: Array<
    (Spark & { cols?: number; rows?: number }) | ICheckSpark<I, { hidden: boolean; cols: number; rows: number }>
  >;
}

export interface IFlexSpark<I extends Index = Index> extends ISparkFlags {
  spark: 'flex';
  columnGap?: number;
  alignItems?: 'center' | 'start';
  content: Array<
    | (Spark & { grow?: number; basis?: number | string | 'auto' })
    | (ICheckSpark<I, { hidden: boolean; grow: number; basis: number | 'auto' }> & {
        grow: number;
        basis: number | string | 'auto';
      })
  >;
}
export interface ICheckSpark<I extends Index = Index, C extends Record<string, any> = any> extends ISparkFlags {
  spark: 'check';
  space?: Key;
  index: I;
  check: {
    [K in keyof C]?: (value: Value<I>) => C[K];
  };
  content: Spark;
}
export interface ILabelSpark extends ISparkFlags {
  spark: 'label';
  tooltip?: React.ReactNode;
  reverse?: boolean;
  align?: 'center' | 'top';
  label?: React.ReactNode;
  /**
   * 默认 64，建议 72, 80, 88, 96... 以 8 递增
   */
  width?: number;
  content: Spark;
}

/**
 * block 不可定义在 value 之下：block < value < extra
 */
export interface IBlockSpark extends ISparkFlags {
  spark: 'block';
  status?: 'required' | 'recommended' | 'optional' | 'closed' | 'static';
  indices?: OpenKeys;
  content: Spark;
}

/**
 * value 不可定义在 extra 之下：block < value < extra
 */
export interface IValueSpark<I extends Index = Index, M extends boolean = boolean>
  extends Omit<IBaseSpark<Value<I>, I>, 'placeholder'> {
  spark: 'value';
  visit?: boolean;
  multi?: M;
  space?: Key;
  content: (
    value: M extends true ? Array<Value<I>> : Value<I>,
    onChange: OnChange<M extends true ? Array<Value<I>> : Value<I> | ((value: Value<I>) => Value<I>)>
  ) => Spark;
}

export interface IEnterSpark extends ISparkFlags, Omit<IBaseSpark<any>, 'defaultValue' | 'placeholder'> {
  spark: 'enter';
  content: Spark;
}

export interface IBooleanSpark extends IBaseSpark<boolean> {
  spark: 'boolean';
  type?: 'checkbox' | 'switch' | 'radio' | 'visible' | 'locked' | 'enabled';
  size?: 'small';
  children?: React.ReactNode;
}

export interface IColorSpark extends IBaseSpark<string>, Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'color';
  disableAlpha?: boolean;
  stretch?: boolean;
}

export interface ISliderSpark
  extends IBaseSpark<
      number | undefined | [number | undefined, number | undefined],
      Key | [string, string] | [number, number]
    >,
    Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'slider';
  inputNumber?: boolean;
  precision?: number;
  ratio?: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

export interface INumberSpark
  extends IBaseSpark<number | undefined>,
    Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'number';
  precision?: number;
  /**
   * 正数表示放大，负数表示缩小。比如 `-1000` 与 `0.001` 效果相同，但避免浮点数运算的损失。
   */
  ratio?: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

export interface ISelectSpark
  extends IBaseSpark<number | string | boolean | undefined>,
    Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'select';
  loading?: boolean;
  options?: ReadonlyArray<{
    label?: React.ReactNode;
    value: number | string | boolean | undefined;
    tooltip?: React.ReactNode;
  }>;
  input?: boolean;
}

export interface IRadioGroupSpark
  extends IBaseSpark<number | string | boolean | undefined>,
    Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'radioGroup';
  options?: ReadonlyArray<{
    label?: React.ReactNode;
    value: number | string | boolean | undefined;
  }>;
  size?: ComponentProps<typeof Radio.Group>['size'];
}

export interface IStringSpark extends IBaseSpark<string>, Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'string';
  type?: 'line' | 'area';
  /** 文本检验正则表达式 */
  accept?: string;
  min?: number;
  max?: number;
  allowClear?: boolean;
}

export interface IDateRangeSpark
  extends IBaseSpark<[string, string], Index>,
    Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'> {
  spark: 'dateRange';
}

export interface IElementSpark extends ISparkFlags {
  spark: 'element';
  space?: Key;
  content: (render: (cell: SparkValue) => React.ReactNode, flags: ISparkFlags) => React.ReactNode;
}

export interface IContext {
  useValue<I extends Index>(
    index: I,
    isEqual?: (v1: Array<Value<I>>, v2: Array<Value<I>>) => boolean
  ): UseValue<Array<Value<I>>>;
  openKeys: {
    setOpenKeys?: (checked: boolean, slice: OpenKeys, ids?: number[]) => void;
    setEnabled?: (enabled: boolean, ids?: number[]) => void;
    openKeys?: OpenKeys;
    checking?: boolean;
    enabled?: boolean;
  };
  visiting: {
    prev?: Array<{ label: React.ReactNode; index: Key }>;
    next?: Array<Key>;
    onVisit(indices: Array<Key>): void;
  };
  blueprint?: {
    enabled?: boolean;
  };
}

export interface IBaseSpark<T = any, I extends Index = Key> extends ISparkFlags {
  index: I;
  tabIndex?: number;
  defaultValue?: T;
  placeholder?: string;
  required?: boolean;
}

export interface ISparkFlags {
  readOnly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}
