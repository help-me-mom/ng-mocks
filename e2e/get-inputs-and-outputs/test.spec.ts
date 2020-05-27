import { TestBed } from '@angular/core/testing';

import { MockHelper } from '../../lib/mock-helper';
import { MockRender } from '../../lib/mock-render';

import { Target2Directive, Target3Directive, TargetComponent, TargetModule } from './fixtures';

describe('get-inputs-and-outputs', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents()
  );

  it('finds them correctly', () => {
    const params = {
      input1: '1',
      input2: '2',
      output1: jasmine.createSpy('output1'),
      output2: jasmine.createSpy('output2'),
      output3: jasmine.createSpy('output3'),
    };
    const fixture = MockRender<TargetComponent, typeof params>(
      `<target
        [input1]="input1"
        [input2]="input2"
        input3="3"
        (output1)="output1($event)"
        (output2)="output2($event)"
        (output3)="output3($event)"
      ></target>`,
      params
    );

    const componentElement = fixture.point;
    const component = fixture.point.componentInstance;
    const directive2 = MockHelper.getDirectiveOrFail(componentElement, Target2Directive);
    const directive3 = MockHelper.getDirectiveOrFail(componentElement, Target3Directive);

    expect(component.input).toEqual('1');
    params.output1.calls.reset();
    component.output.emit();
    expect(params.output1).toHaveBeenCalled();

    expect(directive2.input).toEqual('2');
    expect(directive2.input2).toEqual(undefined);
    params.output2.calls.reset();
    directive2.output.emit();
    expect(params.output2).toHaveBeenCalled();

    expect(directive3.input).toEqual('3');
    params.output3.calls.reset();
    directive3.output.emit();
    expect(params.output3).toHaveBeenCalled();

    // a really simple wait that allows us to skip pain of knowing directives.
    expect(MockHelper.getInputOrFail(componentElement, 'input1')).toEqual('1');
    expect(MockHelper.getInputOrFail(componentElement, 'input2')).toEqual('2');
    expect(MockHelper.getInputOrFail(componentElement, 'inputUnused')).toEqual(undefined);
    expect(() => MockHelper.getInputOrFail(componentElement, 'inputUndefined')).toThrowError(
      'Cannot find inputUndefined input via MockHelper.getInputOrFail'
    );
    expect(MockHelper.getInputOrFail(componentElement, 'input3')).toEqual('3');
    params.output1.calls.reset();
    MockHelper.getOutputOrFail(componentElement, 'output1').emit();
    expect(params.output1).toHaveBeenCalled();
    params.output2.calls.reset();
    MockHelper.getOutputOrFail(componentElement, 'output2').emit();
    expect(params.output2).toHaveBeenCalled();
    params.output3.calls.reset();
    MockHelper.getOutputOrFail(componentElement, 'output3').emit();
    expect(params.output3).toHaveBeenCalled();
  });
});
