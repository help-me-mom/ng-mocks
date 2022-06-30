import { Component } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'header',
  template: 'header',
  standalone: true,
} as never)
class HeaderComponent {}

@Component({
  selector: 'target',
  template: '<header></header>',
  standalone: true,
  imports: [HeaderComponent],
} as never)
class TargetComponent {}

// @see https://stackoverflow.com/questions/72708580/mockcomponent-still-includes-the-actual-component
describe('spectator:standalone', () => {
  describe('TestBed', () => {
    let spectator: Spectator<TargetComponent>;

    const createComponent = createComponentFactory({
      component: TargetComponent,
    });

    beforeEach(() => (spectator = createComponent()));

    it('keeps header', () => {
      expect(ngMocks.formatHtml(spectator.fixture)).toEqual(
        '<header>header</header>',
      );
    });
  });

  describe('MockBuilder', () => {
    let spectator: Spectator<TargetComponent>;

    const dependencies = MockBuilder(TargetComponent).build();
    const createComponent = createComponentFactory({
      component: TargetComponent,
      ...dependencies,
    });

    beforeEach(() => (spectator = createComponent()));

    it('mocks header', () => {
      expect(ngMocks.formatHtml(spectator.fixture)).toEqual(
        '<header></header>',
      );
    });
  });
});
