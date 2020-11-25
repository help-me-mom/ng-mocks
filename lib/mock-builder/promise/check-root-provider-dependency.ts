export default (provide: any, bucket: any[], touched: any[]): void => {
  if (typeof provide === 'function' && touched.indexOf(provide) === -1) {
    touched.push(provide);
    bucket.push(provide);
  }
};
