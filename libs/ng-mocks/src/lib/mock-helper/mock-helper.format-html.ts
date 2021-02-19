import { MockedDebugNode } from '../mock-render/types';

import nestedCheckChildren from './crawl/nested-check-children';

const isDebugNode = (value: any): value is MockedDebugNode => {
  return !!value.nativeElement || !!value.nativeNode;
};

const isHtmlElement = (value: any): value is HTMLElement => {
  return !!value && typeof value === 'object' && value.innerHTML !== undefined;
};

const isText = (value: any): value is Text => {
  return !!value && typeof value === 'object' && value.nodeName === '#text';
};

const isFixture = (value: any): value is { debugElement: MockedDebugNode } => {
  return !!value && typeof value === 'object' && value.debugElement !== undefined;
};

const normalizeHtml = (html: string | undefined): string =>
  html
    ? html
        .replace(new RegExp('\\s+', 'mg'), ' ')
        .replace(new RegExp('<!--.*?-->', 'mg'), '')
        .replace(new RegExp('\\s+', 'mg'), ' ')
        .replace(new RegExp('>\\s+<', 'mg'), '><')
        .trim()
    : '';

const normalizeText = (text: string): string =>
  text
    .replace(new RegExp('&', 'mg'), '&amp;')
    .replace(new RegExp('"', 'mg'), '&quot;')
    .replace(new RegExp('<', 'mg'), '&lt;')
    .replace(new RegExp('>', 'mg'), '&gt;');

const handleArray = (formatCallback: any, html: any) => {
  return formatCallback((html as any[]).map(item => format(item, true)).join(''));
};

const handlePrimitives = (formatCallback: any, html: any, outer: boolean) => {
  if (typeof html === 'string' || html === undefined) {
    return normalizeHtml(html);
  }
  if (Array.isArray(html)) {
    return handleArray(formatCallback, html);
  }
  if (isFixture(html)) {
    return formatCallback(html.debugElement, outer);
  }
  if (isHtmlElement(html)) {
    return formatCallback(outer ? html.outerHTML : html.innerHTML);
  }
  if (isText(html)) {
    const value = normalizeText(html.nodeValue ?? html.textContent ?? html.wholeText);

    return outer ? value : value.trim();
  }
};

const format = (
  html:
    | string
    | HTMLElement
    | Text
    | Comment
    | { nativeNode: any }
    | { nativeElement: any }
    | { debugElement: any }
    | string[]
    | Array<HTMLElement | Text | Comment>
    | Array<{ nativeNode: any } | { nativeElement: any } | { debugElement: any }>,
  outer = false,
): string => {
  const result = handlePrimitives(format, html, outer);
  if (result !== undefined) {
    return result;
  }

  if (isDebugNode(html) && html.nativeNode.nodeName === '#comment') {
    return format(nestedCheckChildren(html), true);
  }

  return isDebugNode(html) ? format(html.nativeNode, outer) : '';
};

export default (() => format)();
