import { Directive, InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[excluded]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ExcludedDeclaration {}

interface CyclicNode {
  label: string;
  excluded?: typeof ExcludedDeclaration;
  next?: CyclicNode;
  alias?: CyclicNode;
}

const self: CyclicNode = {
  label: 'self',
  excluded: ExcludedDeclaration,
};
self.next = self;
self.alias = self;

const left: CyclicNode = { label: 'left' };
const right: CyclicNode = {
  label: 'right',
  excluded: ExcludedDeclaration,
};
left.next = right;
left.alias = right;
right.next = left;
right.alias = left;

const original = { self, left };
const CONFIG = new InjectionToken<typeof original>(
  'issue-14927-cycles',
);

@NgModule({
  declarations: [ExcludedDeclaration],
  providers: [{ provide: CONFIG, useValue: original }],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14927
describe('issue-14927:cycles', () => {
  it('keeps changed self-references inside the transformed graph', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .exclude(ExcludedDeclaration);

    const config = ngMocks.get(CONFIG);

    // Returning the original node on a cache hit restores the excluded reference.
    expect(config).not.toBe(original);
    expect(config.self).not.toBe(self);
    expect(config.self.label).toEqual('self');
    expect(config.self.excluded).toBeUndefined();
    expect(config.self.next).toBe(config.self);
    expect(config.self.alias).toBe(config.self);
    expect(config.self.next!.excluded).toBeUndefined();
    expect(config.self.alias!.excluded).toBeUndefined();

    expect(original.self).toBe(self);
    expect(self.excluded).toBe(ExcludedDeclaration);
    expect(self.next).toBe(self);
    expect(self.alias).toBe(self);
  });

  it('keeps changed mutual references and aliases inside the transformed graph', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .exclude(ExcludedDeclaration);

    const config = ngMocks.get(CONFIG);
    const processedLeft = config.left;
    const processedRight = processedLeft.next!;

    expect(config).not.toBe(original);
    expect(processedLeft).not.toBe(left);
    expect(processedRight).not.toBe(right);
    expect(processedLeft.label).toEqual('left');
    expect(processedRight.label).toEqual('right');
    expect(processedLeft.alias).toBe(processedRight);
    expect(processedRight.next).toBe(processedLeft);
    expect(processedRight.alias).toBe(processedLeft);
    expect(processedRight.excluded).toBeUndefined();
    expect(processedLeft.alias!.excluded).toBeUndefined();
    expect(processedRight.next!.next).toBe(processedRight);

    expect(original.left).toBe(left);
    expect(left.next).toBe(right);
    expect(left.alias).toBe(right);
    expect(right.next).toBe(left);
    expect(right.alias).toBe(left);
    expect(right.excluded).toBe(ExcludedDeclaration);
  });

  it('preserves original identity when the cyclic graph is unchanged', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .keep(ExcludedDeclaration);

    const config = ngMocks.get(CONFIG);

    expect(config).toBe(original);
    expect(config.self).toBe(self);
    expect(config.self.next).toBe(self);
    expect(config.self.alias).toBe(self);
    expect(config.self.excluded).toBe(ExcludedDeclaration);
    expect(config.left).toBe(left);
    expect(config.left.next).toBe(right);
    expect(config.left.alias).toBe(right);
    expect(config.left.next!.next).toBe(left);
    expect(config.left.next!.alias).toBe(left);
    expect(config.left.next!.excluded).toBe(ExcludedDeclaration);
  });
});
