export const isMacOS = /Mac OS X/.test(window.navigator.userAgent);
export const onMacOS = <T>(whenTrue: T, whenFalse: T): T => (isMacOS ? whenTrue : whenFalse);
