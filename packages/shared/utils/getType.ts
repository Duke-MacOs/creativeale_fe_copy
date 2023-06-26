export const isBaseType = (target: any) => {
  const type = Object.prototype.toString.call(target);
  return (
    type === '[object String]' ||
    type === '[object Number]' ||
    type === '[object Boolean]' ||
    type === '[object Undefined]' ||
    type === '[object Null]'
  );
};

export const getTypeCN = (target: any) => {
  const type = Object.prototype.toString.call(target);
  switch (type) {
    case '[object Array]':
      return '数组';
    case '[object Object]':
      return '对象';
    case '[object Boolean]':
      return '布尔值';
    case '[object String]':
      return '字符串';
    case '[object Number]':
      return '数字';
    case '[object Null]':
      return '无效值';
    case '[object Symbol]':
      return '唯一值';
    default:
      return 'undefined';
  }
};
