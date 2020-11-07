import { FormsModule, NgModel } from '@angular/forms';
import { MockBuilder, MockComponent, MockRender, ngMocks } from 'ng-mocks';

import { ControlComponent, TargetComponent, TargetModule } from './fixtures';

// a real case to check possible behavior.
describe('control-value-accessor-ng-model:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('respects our ngModel', async () => {
    const fixture = MockRender(TargetComponent, {}, false);
    const mockElement = ngMocks.find(fixture.debugElement, ControlComponent);
    const mock = mockElement.componentInstance;
    spyOn(mock, 'writeValue').and.callThrough();
    spyOn(mock, 'setDisabledState').and.callThrough();
    const ngModel = ngMocks.get(mockElement, NgModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mock.writeValue).toHaveBeenCalledWith(null);
    expect(mock.setDisabledState).not.toHaveBeenCalled();
    expect(ngModel.touched).toBeFalsy();

    // checking via original component
    fixture.point.componentInstance.value = 'test1';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.writeValue).toHaveBeenCalledWith('test1');
    expect(ngModel.touched).toBeFalsy();

    fixture.point.componentInstance.value = 'test2';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.writeValue).toHaveBeenCalledWith('test2');
    expect(ngModel.touched).toBeFalsy();

    // checking that touch works
    mock.changeTouch();
    expect(ngModel.touched).toBeTruthy();

    // checking that reset works
    ngModel.control.markAsUntouched();
    expect(ngModel.touched).toBeFalsy();

    // checking that disabled works
    fixture.point.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(true);
    fixture.point.componentInstance.disabled = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(false);

    // changeValue doesn't trigger anything else but the callback. Therefore it doesn't render new value.
    // It only updates the original control's value.
    mock.changeValue('test3');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test3');
    expect(ngModel.touched).toBeFalsy();
    expect(fixture.point.componentInstance.value).toBe('test3');
  });
});

// a way that ensures that a mock component behaves the same way as real one.
describe('control-value-accessor-ng-model:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(FormsModule));

  it('respects our ngModel', async () => {
    const fixture = MockRender(TargetComponent, {}, false);
    const mockElement = ngMocks.find(fixture.debugElement, MockComponent(ControlComponent));
    const mock = mockElement.componentInstance;
    spyOn(mock, 'writeValue').and.callThrough();
    spyOn(mock, 'setDisabledState').and.callThrough();
    spyOn(mock, 'registerOnChange').and.callThrough();
    spyOn(mock, 'registerOnTouched').and.callThrough();
    const ngModel = ngMocks.get(mockElement, NgModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mock.writeValue).toHaveBeenCalledWith(null);
    expect(mock.setDisabledState).not.toHaveBeenCalled();
    expect(ngModel.touched).toBeFalsy();

    // checking via original component
    fixture.point.componentInstance.value = 'test1';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.writeValue).toHaveBeenCalledWith('test1');
    expect(ngModel.touched).toBeFalsy();

    fixture.point.componentInstance.value = 'test2';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.writeValue).toHaveBeenCalledWith('test2');
    expect(ngModel.touched).toBeFalsy();

    // checking that touch works
    mock.__simulateTouch();
    expect(ngModel.touched).toBeTruthy();
    ngModel.control.markAsUntouched();
    expect(ngModel.touched).toBeFalsy();
    // a way through a spy
    ngMocks.stub<any>(mock, 'registerOnTouched').calls.first().args[0]();
    expect(ngModel.touched).toBeTruthy();
    ngModel.control.markAsUntouched();

    // checking that disabled works
    fixture.point.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(true);
    fixture.point.componentInstance.disabled = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(false);

    // changeValue doesn't trigger anything else but the callback. Therefore it doesn't render new value.
    // It only updates the original control's value.
    mock.__simulateChange('test3');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test3');
    expect(ngModel.touched).toBeFalsy();
    expect(fixture.point.componentInstance.value).toBe('test3');
    // a way through a spy
    ngMocks.stub<any>(mock, 'registerOnChange').calls.first().args[0]('test4');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test4');
    expect(ngModel.touched).toBeFalsy();
    expect(ngModel.value).toBe('test4');
  });
});
