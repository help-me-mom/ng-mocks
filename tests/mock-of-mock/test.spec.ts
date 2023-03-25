import {
  Component,
  Directive,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  isMockNgDef,
  MockComponent,
  MockDirective,
  MockModule,
  MockPipe,
} from 'ng-mocks';

@Component({
  selector: 'target-mock-of-mock',
  template: '',
})
class TargetComponent {}

@Directive({
  selector: 'target-mock-of-mock',
})
class TargetDirective {}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(value: any): any {
    return value;
  }
}

@NgModule({})
class TargetModule {}

describe('mock-of-mock', () => {
  it('returns the same mock component', () => {
    const mock1 = MockComponent(TargetComponent);
    const mock2 = MockComponent(mock1);
    expect(mock1).not.toBe(TargetComponent);
    expect(mock2).toBe(mock1);
    expect(isMockNgDef(mock2)).toEqual(true);
    expect(isMockNgDef(mock2, 'c')).toEqual(true);
    expect(isMockNgDef(mock2, 'd')).toEqual(false);
    expect(isMockNgDef(mock2, 'p')).toEqual(false);
    expect(isMockNgDef(mock2, 'm')).toEqual(false);
  });

  it('returns the same mock directive', () => {
    const mock1 = MockDirective(TargetDirective);
    const mock2 = MockDirective(mock1);
    expect(mock1).not.toBe(TargetDirective);
    expect(mock2).toBe(mock1);
    expect(isMockNgDef(mock2)).toEqual(true);
    expect(isMockNgDef(mock2, 'c')).toEqual(false);
    expect(isMockNgDef(mock2, 'd')).toEqual(true);
    expect(isMockNgDef(mock2, 'p')).toEqual(false);
    expect(isMockNgDef(mock2, 'm')).toEqual(false);
  });

  it('returns the same mock pipe', () => {
    const mock1 = MockPipe(TargetPipe);
    const mock2 = MockPipe(mock1);
    expect(mock1).not.toBe(TargetPipe);
    expect(mock2).toBe(mock1);
    expect(isMockNgDef(mock2)).toEqual(true);
    expect(isMockNgDef(mock2, 'c')).toEqual(false);
    expect(isMockNgDef(mock2, 'd')).toEqual(false);
    expect(isMockNgDef(mock2, 'p')).toEqual(true);
    expect(isMockNgDef(mock2, 'm')).toEqual(false);
  });

  it('returns the same mock module', () => {
    const mock1 = MockModule(TargetModule);
    const mock2 = MockModule(mock1);
    expect(mock1).not.toBe(TargetModule);
    expect(mock2).toBe(mock1);
    expect(isMockNgDef(mock2)).toEqual(true);
    expect(isMockNgDef(mock2, 'c')).toEqual(false);
    expect(isMockNgDef(mock2, 'd')).toEqual(false);
    expect(isMockNgDef(mock2, 'p')).toEqual(false);
    expect(isMockNgDef(mock2, 'm')).toEqual(true);
  });
});
