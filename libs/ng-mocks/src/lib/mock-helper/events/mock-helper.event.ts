import mockHelperStub from '../mock-helper.stub';

/**
 * @see https://developer.mozilla.org/de/docs/Web/Events
 */
const preventBubble = ['focus', 'blur', 'load', 'unload', 'change', 'reset', 'scroll'];

// istanbul ignore next
const customEvent = (event: string, params?: EventInit) => {
  const initParams = {
    bubbles: false,
    cancelable: false,
    ...params,
  };
  const eventObj = document.createEvent('CustomEvent');
  eventObj.initCustomEvent(event, initParams.bubbles, initParams.cancelable, null);

  return eventObj;
};

const eventCtor =
  typeof (Event as any) === 'function'
    ? (event: string, init?: EventInit): CustomEvent => new CustomEvent(event, init)
    : /* istanbul ignore next */ customEvent;

const keyMap: Record<string, object> = {
  alt: {
    altKey: true,
    code: 'AltLeft',
    key: 'Alt',
    location: 1,
    which: 18,
  },
  arrowdown: {
    code: 'ArrowDown',
    key: 'ArrowDown',
    location: 0,
    which: 40,
  },
  arrowleft: {
    code: 'ArrowLeft',
    key: 'ArrowLeft',
    location: 0,
    which: 37,
  },
  arrowright: {
    code: 'ArrowRight',
    key: 'ArrowRight',
    location: 0,
    which: 39,
  },
  arrowup: {
    code: 'ArrowUp',
    key: 'ArrowUp',
    location: 0,
    which: 38,
  },
  backspace: {
    code: 'Backspace',
    key: 'Backspace',
    location: 0,
    which: 8,
  },
  control: {
    code: 'ControlLeft',
    ctrlKey: true,
    key: 'Control',
    location: 1,
    which: 17,
  },
  enter: {
    code: 'Enter',
    key: 'Enter',
    location: 0,
    which: 13,
  },
  esc: {
    code: 'Escape',
    key: 'Escape',
    location: 0,
    which: 27,
  },
  meta: {
    code: 'MetaLeft',
    key: 'Meta',
    location: 1,
    metaKey: true,
    which: 91,
  },
  shift: {
    code: 'ShiftLeft',
    key: 'Shift',
    location: 1,
    shiftKey: true,
    which: 16,
  },
  space: {
    code: 'Space',
    key: ' ',
    location: 0,
    which: 32,
  },
  tab: {
    code: 'Tab',
    key: 'Tab',
    location: 0,
    which: 9,
  },
};
for (let f = 1; f <= 12; f += 1) {
  keyMap[`f${f}`] = {
    code: `F${f}`,
    key: `F${f}`,
    location: 0,
    which: f + 111,
  };
}

const getCode = (char: string): string => {
  const code = char.codePointAt(0);
  // a-z
  if (code && code >= 97 && code <= 122) {
    return `Key${char.toUpperCase()}`;
  }
  // A-Z
  if (code && code >= 65 && code <= 90) {
    return `Key${char.toUpperCase()}`;
  }
  // A-Z
  if (code && code >= 48 && code <= 57) {
    return `Digit${char}`;
  }

  return 'Unknown';
};

const applyPayload = (event: Event, payload?: string): void => {
  const keyData: object = {};
  for (const key of payload ? payload.split('.') : []) {
    let map = keyMap[key];
    if (!map && key.length === 1) {
      map = {
        code: getCode(key),
        key,
      };
    }

    if (!map) {
      throw new Error(`Unknown event part ${key}`);
    }

    mockHelperStub(keyData, map);
  }

  if (payload) {
    mockHelperStub(event, keyData);
  }
};

export default (
  event: string,
  init?: EventInit,
  overrides?: Partial<UIEvent | KeyboardEvent | MouseEvent | TouchEvent | Event>,
): CustomEvent => {
  const dot = event.indexOf('.');
  const [eventName, eventPayload] = dot === -1 ? [event] : [event.slice(0, Math.max(0, dot)), event.slice(dot + 1)];
  const eventObj = eventCtor(eventName, {
    bubbles: preventBubble.indexOf(event) === -1,
    cancelable: true,
    ...init,
  });
  applyPayload(eventObj, eventPayload);

  if (overrides) {
    mockHelperStub(eventObj, overrides);
  }

  return eventObj;
};
