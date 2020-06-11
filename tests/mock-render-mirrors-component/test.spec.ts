import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { first } from 'rxjs/operators';

@Component({
  selector: 'target',
  template: `
    <div data-role="input1">{{ input1 || 'input1' }}</div>
    <div data-role="input2">{{ input2 || 'input2' }}</div>
    <div data-role="output1" (click)="output1.emit()">output1</div>
    <div data-role="output2" (click)="output2.emit()">output2</div>
    <div data-role="var1">{{ var1 || 'var1' }}</div>
    <div data-role="var2">{{ var2 || 'var2' }}</div>
  `,
})
export class TargetComponent {
  @Input() public input1: string | null = null;
  @Input('input') public input2: string | null = null;

  @Output() public output1: EventEmitter<void> = new EventEmitter();
  @Output('output') public output2: EventEmitter<void> = new EventEmitter();

  public var1 = '';
  public var2 = '';

  public test(var2: string): void {
    this.var2 = var2;
  }
}

@NgModule({
  declarations: [TargetComponent],
})
export class TargetModule {}

describe('mock-render-mirrors-component', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('mirrors the desired component if no params were passed', () => {
    const fixture = MockRender(TargetComponent);

    const input1 = ngMocks.find(fixture.debugElement, '[data-role="input1"]');
    const input2 = ngMocks.find(fixture.debugElement, '[data-role="input2"]');
    const output1 = ngMocks.find(fixture.debugElement, '[data-role="output1"]');
    const output2 = ngMocks.find(fixture.debugElement, '[data-role="output2"]');
    const var1 = ngMocks.find(fixture.debugElement, '[data-role="var1"]');
    const var2 = ngMocks.find(fixture.debugElement, '[data-role="var2"]');

    // initial state
    expect(input1.nativeElement.innerHTML).toEqual('input1');
    expect(input2.nativeElement.innerHTML).toEqual('input2');
    expect(output1.nativeElement.innerHTML).toEqual('output1');
    expect(output2.nativeElement.innerHTML).toEqual('output2');
    expect(var1.nativeElement.innerHTML).toEqual('var1');
    expect(var2.nativeElement.innerHTML).toEqual('var2');

    // updating inputs and properties, calling methods.
    fixture.componentInstance.input1 = 'updatedInput1';
    fixture.componentInstance.input2 = 'updatedInput2';
    fixture.componentInstance.var1 = 'updatedVar1';
    fixture.componentInstance.test('updatedVar2');
    fixture.detectChanges();

    // checking that the data has been proxied correctly
    expect(input1.nativeElement.innerHTML).toEqual('updatedInput1');
    expect(input2.nativeElement.innerHTML).toEqual('updatedInput2');
    // doesn't work because we can't correctly detect it via defineProperty.
    // expect(var1.nativeElement.innerHTML).toEqual('updatedVar1');
    expect(var2.nativeElement.innerHTML).toEqual('updatedVar2');

    // checking output1
    let updatedOutput1 = false;
    fixture.componentInstance.output1.pipe(first()).subscribe(() => (updatedOutput1 = true));
    output1.triggerEventHandler('click', null);
    expect(updatedOutput1).toBe(true);

    // checking output2
    let updatedOutput2 = false;
    fixture.componentInstance.output2.pipe(first()).subscribe(() => (updatedOutput2 = true));
    output2.triggerEventHandler('click', null);
    expect(updatedOutput2).toBe(true);
  });
});
