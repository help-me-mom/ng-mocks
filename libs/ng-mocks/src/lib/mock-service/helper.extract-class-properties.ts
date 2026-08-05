const identifier = '[A-Za-z_$][A-Za-z0-9_$]*';

const findQuoteEnd = (source: string, start: number): number => {
  const quote = source[start];
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') {
      index += 1;
    } else if (source[index] === quote) {
      return index;
    }
  }

  return source.length;
};

const findClosing = (source: string, start: number, opening: string, closing: string): number => {
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' || char === "'" || char === '`') {
      index = findQuoteEnd(source, index);
    } else if (source.slice(index, index + 2) === '//') {
      index = source.indexOf('\n', index + 2);
      if (index === -1) {
        return source.length;
      }
    } else if (source.slice(index, index + 2) === '/*') {
      index = source.indexOf('*/', index + 2);
      if (index === -1) {
        return source.length;
      }
      index += 1;
    } else if (char === opening) {
      depth += 1;
    } else if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return source.length;
};

const splitTopLevel = (source: string, separator: string): string[] => {
  const result: string[] = [];
  let start = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' || char === "'" || char === '`') {
      index = findQuoteEnd(source, index);
    } else if (source.slice(index, index + 2) === '//') {
      index = source.indexOf('\n', index + 2);
      if (index === -1) {
        break;
      }
    } else if (source.slice(index, index + 2) === '/*') {
      index = source.indexOf('*/', index + 2);
      if (index === -1) {
        break;
      }
      index += 1;
    } else if (char === '{' || char === '[' || char === '(') {
      const closing = char === '{' ? '}' : char === '[' ? ']' : ')';
      index = findClosing(source, index, char, closing);
    } else if (char === separator) {
      result.push(source.slice(start, index));
      start = index + 1;
    }
  }

  result.push(source.slice(start));

  return result;
};

const trimLeadingComments = (source: string): string => {
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index])) {
      index += 1;
    }
    if (source.slice(index, index + 2) === '//') {
      const newline = source.indexOf('\n', index + 2);
      index = newline === -1 ? source.length : newline + 1;
    } else if (source.slice(index, index + 2) === '/*') {
      const closing = source.indexOf('*/', index + 2);
      index = closing === -1 ? source.length : closing + 2;
    } else {
      break;
    }
  }

  return source.slice(index);
};

const getConstructorBody = (service: any): string => {
  const source = Function.prototype.toString.call(service);
  const constructor = /^\s*class\b/.test(source)
    ? /\bconstructor\s*\(/.exec(source)
    : /\bfunction\b[^(]*\(/.exec(source);
  if (!constructor) {
    return '';
  }

  const parametersStart = source.indexOf('(', constructor.index);
  const parametersEnd = findClosing(source, parametersStart, '(', ')');
  const bodyStart = source.indexOf('{', parametersEnd + 1);
  if (bodyStart === -1) {
    return '';
  }

  return source.slice(bodyStart + 1, findClosing(source, bodyStart, '{', '}'));
};

const mockFunction = () => undefined;

const parseObject = (source: string): Record<keyof any, any> => {
  const result: Record<keyof any, any> = {};

  for (const property of splitTopLevel(source, ',')) {
    const definition = trimLeadingComments(property);
    const method = new RegExp(`^(?:async\\s+)?\\*?\\s*(?:['"](${identifier})['"]|(${identifier}))\\s*\\(`).exec(
      definition,
    );
    if (method) {
      result[method[1] || method[2]] = mockFunction;
      continue;
    }

    const match = new RegExp(`^(?:['"](${identifier})['"]|(${identifier}))\\s*:\\s*([\\s\\S]*)$`).exec(definition);
    if (!match) {
      continue;
    }

    const key = match[1] || match[2];
    const value = parseValue(match[3]);
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
};

const parseValue = (source: string): any => {
  const value = source.trim();
  if (value.startsWith('{')) {
    return parseObject(value.slice(1, findClosing(value, 0, '{', '}')));
  }
  if (value.startsWith('[')) {
    return [];
  }
  if (/^(?:async\s+)?function\b|^(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>/.test(value)) {
    return mockFunction;
  }

  return undefined;
};

export default (service: any): Record<keyof any, any> => {
  const result: Record<keyof any, any> = {};
  const assignment = new RegExp(`^\\s*this(?:\\.(${identifier})|\\[['"](${identifier})['"]\\])\\s*=\\s*([\\s\\S]*)$`);

  for (const statement of splitTopLevel(getConstructorBody(service), ';')) {
    const match = assignment.exec(trimLeadingComments(statement));
    if (!match) {
      continue;
    }

    const key = match[1] || match[2];
    const value = parseValue(match[3]);
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
};
