export default (provide: any, bucket: any[], touched: Set<any>): void => {
  if (typeof provide === 'function' && !touched.has(provide)) {
    touched.add(provide);
    bucket.push(provide);
  }
};
