import { NgModule } from '@angular/core';

import { funcExtractDeps } from './func.extract-deps';

@NgModule({})
class Issue7490Level4Module {}

@NgModule({
  imports: [Issue7490Level4Module],
})
class Issue7490Level3Module {}

@NgModule({
  imports: [Issue7490Level3Module],
})
class Issue7490Level2Module {}

@NgModule({
  imports: [Issue7490Level2Module],
})
class Issue7490Level1Module {}

describe('funcExtractDeps', () => {
  it('collects recursive dependencies to their full depth', () => {
    const result = funcExtractDeps(
      Issue7490Level1Module,
      new Set(),
      true,
    );

    expect(result.size).toBe(3);
    expect(result.has(Issue7490Level2Module)).toBe(true);
    expect(result.has(Issue7490Level3Module)).toBe(true);
    expect(result.has(Issue7490Level4Module)).toBe(true);
  });

  it('traverses dependencies already present in the destination', () => {
    const result = funcExtractDeps(
      Issue7490Level1Module,
      new Set([Issue7490Level2Module]),
      true,
    );

    expect(result.size).toBe(3);
    expect(result.has(Issue7490Level3Module)).toBe(true);
    expect(result.has(Issue7490Level4Module)).toBe(true);
  });
});
