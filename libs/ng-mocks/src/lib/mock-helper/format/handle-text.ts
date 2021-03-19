export default (html: Text): string => html.nodeValue ?? html.textContent ?? html.wholeText;
