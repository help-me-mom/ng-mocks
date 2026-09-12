import { jest } from '@jest/globals';
import { MockComponent } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/14931
describe('issue-14931:esm', () => {
  it('loads the public import entry in native Jest ESM', () => {
    expect(import.meta.jest).toBe(jest);
    expect(typeof require).toBe('undefined');
    expect(import.meta.resolve('ng-mocks')).toMatch(
      /\/node_modules\/ng-mocks\/index\.mjs$/,
    );
    expect(typeof MockComponent).toBe('function');
  });
});
