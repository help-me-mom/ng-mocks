import formatHandler from './format-handler';
import handleText from './handle-text';
import isHtmlElement from './is-html-element';
import isText from './is-text';

const normalizeValue = (html: string | undefined): string =>
  html
    ? html
        .replace(new RegExp('\\s+', 'mg'), ' ')
        .replace(new RegExp('<!--(.|\\n|\\r)*?-->|<!--(.|\\n|\\r)*', 'mg'), '')
        .replace(new RegExp('\\s+', 'mg'), ' ')
        .replace(new RegExp('>\\s+<', 'mg'), '><')
        .replace(new RegExp('"\\s+>', 'mg'), '">')
    : '';

const normalizeText = (text: string): string =>
  text
    .replace(new RegExp('&', 'mg'), '&amp;')
    .replace(new RegExp('"', 'mg'), '&quot;')
    .replace(new RegExp('<', 'mg'), '&lt;')
    .replace(new RegExp('>', 'mg'), '&gt;')
    .replace(new RegExp("'", 'mg'), '&#39;');

const getElementValue = (element: HTMLElement, outer: boolean): string =>
  outer ? element.outerHTML : element.innerHTML;

const handlePrimitives = (format: any, value: any, outer: boolean): string | undefined => {
  if (typeof value === 'string' || value === undefined) {
    const result = normalizeValue(value);

    return outer ? result : result.trim();
  }
  if (isHtmlElement(value)) {
    return format(getElementValue(value, outer));
  }
  if (isText(value)) {
    return handlePrimitives(format, normalizeText(handleText(value)), outer);
  }

  return undefined;
};

export default (() => formatHandler(handlePrimitives))();
