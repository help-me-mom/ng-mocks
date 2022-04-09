import { Component, Injectable, NgModule } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name: string = 'target';
}

@Component({
  selector: 'target',
  template: ':{{ service.name }}:',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

ngMocks.defaultMock(TargetService, () => ({
  name: 'mock',
}));

// ngMocks.guts and MockBuilder.build should be compatible with createComponentFactory.
// @see https://github.com/ike18t/ng-mocks/issues/971#issuecomment-902467692
describe('issue-971', () => {
  describe('ngMocks.guts', () => {
    let spectator: Spectator<TargetComponent>;

    const dependencies = ngMocks.guts(
      null,
      TargetModule,
      TargetComponent,
    );
    const createComponent = createComponentFactory({
      component: TargetComponent,
      ...dependencies,
    });

    beforeEach(() => (spectator = createComponent()));

    it('applies mocks', () => {
      expect(ngMocks.formatText(spectator.fixture)).toEqual(':mock:');
    });
  });

  describe('MockBuilder', () => {
    let spectator: Spectator<TargetComponent>;

    const dependencies = MockBuilder(null, TargetModule)
      .exclude(TargetComponent)
      .build();
    const createComponent = createComponentFactory({
      component: TargetComponent,
      ...dependencies,
    });

    beforeEach(() => (spectator = createComponent()));

    it('applies mocks', () => {
      expect(ngMocks.formatText(spectator.fixture)).toEqual(':mock:');
    });
  });
});
