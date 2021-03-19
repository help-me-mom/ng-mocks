export default (format: any, html: any) => {
  return format((html as any[]).map(item => format(item, true)).join(''));
};
