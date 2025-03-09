import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockModule, MockRender } from 'ng-mocks';
import { NgxFileDropModule } from 'ngx-file-drop';

@Component({
  selector: 'app-target',
  template: `<ngx-file-drop></ngx-file-drop>`,
  standalone: false,
})
class TargetComponent {}

describe('issue-10762', () => {
  describe('ng-mocks:MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        imports: [MockModule(NgxFileDropModule)],
      }).compileComponents(),
    );

    it('creates component', () => {
      expect(() =>
        TestBed.createComponent(TargetComponent).detectChanges(),
      ).not.toThrow();
    });
  });

  describe('ng-mocks:MockBuilder', () => {
    beforeEach(() => MockBuilder(TargetComponent, NgxFileDropModule));

    it('creates component', () => {
      expect(() => MockRender(TargetComponent)).not.toThrow();
    });
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        imports: [NgxFileDropModule],
      }).compileComponents(),
    );

    it('creates component', () => {
      expect(() =>
        TestBed.createComponent(TargetComponent).detectChanges(),
      ).not.toThrow();
    });
  });
});
