import formatHandler from './format-handler';
import handleText from './handle-text';
import isHtmlElement from './is-html-element';
import isText from './is-text';

const normalizeValue = (html: string | undefined): string => (html ? html.replace(new RegExp('\\s+', 'mg'), ' ') : '');

const getElementValue = (element: HTMLElement, outer: boolean): string => {
  const value = element.textContent ?? '';

  return outer ? value : value.trim();
};

const handlePrimitives = (format: any, value: any, outer: boolean): string | undefined => {
  if (typeof value === 'string' || value === undefined) {
    const result = normalizeValue(value);

    return outer ? result : result.trim();
  }
  if (isHtmlElement(value)) {
    return format(getElementValue(value, outer));
  }
  if (isText(value)) {
    return handlePrimitives(format, handleText(value), outer);
  }

  return undefined;
};

export default (() => formatHandler(handlePrimitives))();
