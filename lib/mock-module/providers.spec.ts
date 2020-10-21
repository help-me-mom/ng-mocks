import { Injectable, NgModule } from '@angular/core';
import { isMockedNgDefOf, MockModule } from 'ng-mocks';

@Injectable()
class TargetService {}

@NgModule({
  providers: [TargetService],
})
class Target1Module {}

@NgModule({
  providers: [TargetService],
})
class Target2Module {}

describe('MockProvider', () => {
  it('reuses mock for services', () => {
    const mock1 = MockModule(Target1Module);
    const mock2 = MockModule(Target2Module);
    expect(isMockedNgDefOf(mock1, Target1Module, 'm')).toBeTruthy();
    expect(isMockedNgDefOf(mock2, Target2Module, 'm')).toBeTruthy();
  });
});
