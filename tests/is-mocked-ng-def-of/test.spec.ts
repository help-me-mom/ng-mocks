import {
  Component,
  Directive,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  isMockedNgDefOf,
  MockComponent,
  MockDirective,
  MockModule,
  MockPipe,
} from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected name = 'pipe:';

  public transform(value: string): any {
    return `${this.name}${value}`;
  }
}

@Component({
  selector: 'target-is-mocked-ng-def-of',
  template: 'target',
})
class TargetComponent {}

@Directive({
  selector: 'target-is-mocked-ng-def-of',
})
class TargetDirective {}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
})
class TargetModule {}

describe('isMockedNgDefOf', () => {
  it('module', () => {
    const mock = MockModule(TargetModule);
    expect(isMockedNgDefOf(mock, TargetModule, 'm')).toBeTruthy();
    expect(isMockedNgDefOf(mock, TargetModule)).toBeTruthy();
  });

  it('component', () => {
    const mock = MockComponent(TargetComponent);
    expect(isMockedNgDefOf(mock, TargetComponent, 'c')).toBeTruthy();
    expect(isMockedNgDefOf(mock, TargetComponent)).toBeTruthy();
  });

  it('directive', () => {
    const mock = MockDirective(TargetDirective);
    expect(isMockedNgDefOf(mock, TargetDirective, 'd')).toBeTruthy();
    expect(isMockedNgDefOf(mock, TargetDirective)).toBeTruthy();
  });

  it('pipe', () => {
    const mock = MockPipe(TargetPipe);
    expect(isMockedNgDefOf(mock, TargetPipe, 'p')).toBeTruthy();
    expect(isMockedNgDefOf(mock, TargetPipe)).toBeTruthy();
  });
});
