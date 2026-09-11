import { NgModule } from '@angular/core';

import { AnyDeclaration } from './core.types';
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

@NgModule({
  imports: [Issue7490Level3Module],
})
class Issue14895RealRootModule {}

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

  it('shares traversal state across dependency roots', () => {
    const visited = new Set<AnyDeclaration<any>>();
    const result = funcExtractDeps(
      Issue7490Level1Module,
      new Set(),
      true,
      visited,
    );

    funcExtractDeps(Issue7490Level1Module, result, true, visited);

    expect(result.size).toBe(3);
    expect(visited.size).toBe(4);
  });

  // @see https://github.com/help-me-mom/ng-mocks/issues/14895
  it('collects a blocked dependency without visiting its descendants', () => {
    const visited = new Set<AnyDeclaration<any>>();
    const result = funcExtractDeps(
      Issue7490Level1Module,
      new Set(),
      true,
      visited,
      dependency => dependency !== Issue7490Level2Module,
    );

    expect(result.size).toBe(1);
    expect(result.has(Issue7490Level2Module)).toBe(true);
    expect(result.has(Issue7490Level3Module)).toBe(false);
    expect(result.has(Issue7490Level4Module)).toBe(false);
    expect(visited.size).toBe(1);
    expect(visited.has(Issue7490Level1Module)).toBe(true);
    expect(visited.has(Issue7490Level2Module)).toBe(false);
  });

  it('reaches shared descendants through a later independent root', () => {
    const visited = new Set<AnyDeclaration<any>>();
    const result = funcExtractDeps(
      Issue7490Level1Module,
      new Set(),
      true,
      visited,
      dependency => dependency !== Issue7490Level2Module,
    );

    expect(result.size).toBe(1);
    expect(result.has(Issue7490Level3Module)).toBe(false);
    expect(visited.has(Issue7490Level3Module)).toBe(false);

    funcExtractDeps(
      Issue14895RealRootModule,
      result,
      true,
      visited,
      dependency => dependency !== Issue7490Level2Module,
    );

    expect(result.size).toBe(3);
    expect(result.has(Issue7490Level2Module)).toBe(true);
    expect(result.has(Issue7490Level3Module)).toBe(true);
    expect(result.has(Issue7490Level4Module)).toBe(true);
    expect(visited.size).toBe(4);
    expect(visited.has(Issue7490Level2Module)).toBe(false);
    expect(visited.has(Issue7490Level3Module)).toBe(true);
    expect(visited.has(Issue7490Level4Module)).toBe(true);
  });

  it('preserves shared descendants reached before a blocked dependency', () => {
    const visited = new Set<AnyDeclaration<any>>();
    const result = funcExtractDeps(
      Issue14895RealRootModule,
      new Set(),
      true,
      visited,
      dependency => dependency !== Issue7490Level2Module,
    );

    expect(result.size).toBe(2);
    expect(result.has(Issue7490Level3Module)).toBe(true);
    expect(result.has(Issue7490Level4Module)).toBe(true);

    funcExtractDeps(
      Issue7490Level1Module,
      result,
      true,
      visited,
      dependency => dependency !== Issue7490Level2Module,
    );

    expect(result.size).toBe(3);
    expect(result.has(Issue7490Level2Module)).toBe(true);
    expect(result.has(Issue7490Level3Module)).toBe(true);
    expect(result.has(Issue7490Level4Module)).toBe(true);
    expect(visited.size).toBe(4);
    expect(visited.has(Issue7490Level2Module)).toBe(false);
    expect(visited.has(Issue7490Level3Module)).toBe(true);
    expect(visited.has(Issue7490Level4Module)).toBe(true);
  });
});
