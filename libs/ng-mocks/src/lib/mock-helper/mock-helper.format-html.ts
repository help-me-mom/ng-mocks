const isDebugElement = (value: any): value is { nativeElement: HTMLElement } => {
  return !!value.nativeElement;
};

export default (html: string | HTMLElement | { nativeElement: HTMLElement }): string => {
  const value = typeof html === 'string' ? html : isDebugElement(html) ? html.nativeElement.innerHTML : html.innerHTML;

  return value
    .replace(new RegExp('\\s+', 'mg'), ' ')
    .replace(new RegExp('<!--.*?-->', 'mg'), '')
    .replace(new RegExp('\\s+', 'mg'), ' ');
};
