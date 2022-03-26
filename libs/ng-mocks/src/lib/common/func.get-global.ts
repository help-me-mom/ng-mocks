// istanbul ignore next
export default (): Record<keyof any, any> => (typeof window === 'undefined' ? global : window);
