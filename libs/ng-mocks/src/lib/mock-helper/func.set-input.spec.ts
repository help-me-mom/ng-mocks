import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockBuilder } from '../mock-builder/mock-builder';

import { ngMocks } from './mock-helper';

@Component({
  selector: 'selector-name',
  template: '{{ title() }} {{ description() }}',
})
export class SetInputMockComponent {
  readonly title = input.required<string>();
  readonly description = input('');
}

describe('SetInputMockComponent', () => {
  let component: SetInputMockComponent;
  let fixture: ComponentFixture<SetInputMockComponent>;

  beforeEach(async () => {
    await MockBuilder(SetInputMockComponent);

    fixture = TestBed.createComponent(SetInputMockComponent);
    component = fixture.componentInstance;
    ngMocks.setInput(fixture, 'title', 'new title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required title', () => {
    expect(component.title()).toEqual('new title');
    expect(fixture.nativeElement.textContent).toContain('new title');
  });

  it('should change the value of the input signal', () => {
    ngMocks.setInput(fixture, 'description', 'new description');
    fixture.detectChanges();

    expect(component.description()).toEqual('new description');
    expect(fixture.nativeElement.textContent).toContain(
      'new description',
    );
  });
});
