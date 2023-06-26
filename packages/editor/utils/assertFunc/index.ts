/**
 * 项目组件
 * @param orderId
 * @returns
 */
export function isPrivateComponent(orderId: `${number}` | `${string}`): orderId is `${number}` {
  return isFinite(Number(orderId));
}

/**
 * 公共组件
 * @param orderId
 * @returns
 */
export function isPublicComponent(orderId: `${number}` | `${string}`): orderId is `${string}` {
  return !isPrivateComponent(orderId);
}
