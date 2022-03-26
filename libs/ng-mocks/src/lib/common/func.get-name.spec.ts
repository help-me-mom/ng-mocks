import funcGetName from './func.get-name';

describe('func.get-name', () => {
  it('detects unknown', () => {
    expect(funcGetName(false)).toEqual('unknown');
  });
});
