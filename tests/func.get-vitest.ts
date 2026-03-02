declare let global: any;
declare let window: any;
declare let self: any;

export default () => {
  let globalRef: any;

  if (typeof global !== 'undefined') {
    globalRef = global;
  } else if (typeof window !== 'undefined') {
    globalRef = window;
  } else if (typeof self === 'undefined') {
    try {
      globalRef = new Function('return this')();
    } catch {
      globalRef = undefined;
    }
  } else {
    globalRef = self;
  }

  return (globalRef as any).vi;
};
