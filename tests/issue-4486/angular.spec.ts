import { Component, NgModule, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'real',
  template: 'real',
})
class RealComponent {}

@NgModule({
  declarations: [RealComponent],
  exports: [RealComponent],
})
class RealModule {}

@Component({
  selector: 'nested',
  template: '<real></real>',
})
class NestedComponent {}

@NgModule({
  imports: [RealModule],
  declarations: [NestedComponent],
  exports: [NestedComponent],
})
class NestedModule {}

@Component({
  selector: 'target',
  standalone: true,
  imports: [NestedModule],
  template: `<nested></nested>`,
} as never)
class StandaloneComponent {}

@Component({
  selector: 'real',
  template: 'test',
})
class RealTestingComponent {}

@NgModule({
  declarations: [RealTestingComponent],
  exports: [RealTestingComponent],
})
class RealTestingModule {}

@NgModule({
  declarations: [NestedComponent],
  exports: [NestedComponent],
  imports: [RealTestingModule],
})
class NestedTestingModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4486
describe('issue-4486:angular', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('a14', () => {
      // pending('Need Angular >= 14');
      expect(true).toBeTruthy();
    });

    return;
  }

  // Here we check default behavior of the standalone component.
  describe('default', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StandaloneComponent],
      }).compileComponents();
    });

    it('renders RealComponent', () => {
      const fixture = TestBed.createComponent(StandaloneComponent);
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.textContent).toEqual(
        'real',
      );
    });
  });

  // Here we check whether overrideComponent.set removes imports, and it does.
  describe('overrideComponent:set:empty', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StandaloneComponent],
      })
        .overrideComponent(StandaloneComponent, {
          set: {
            imports: [],
          } as never,
        })
        .compileComponents();
    });

    it('renders nothing', () => {
      const fixture = TestBed.createComponent(StandaloneComponent);
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.textContent).toEqual(
        '',
      );
    });
  });

  // Here we check whether overrideComponent.set changes imports, and it does not, however, it has to.
  describe('overrideComponent:set:NestedTestingModule', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StandaloneComponent],
      })
        .overrideComponent(StandaloneComponent, {
          set: {
            imports: [NestedTestingModule],
          } as never,
        })
        .compileComponents();
    });

    it('renders RealTestingComponent', () => {
      const fixture = TestBed.createComponent(StandaloneComponent);
      fixture.detectChanges();

      // The failure is here.
      expect(fixture.debugElement.nativeElement.textContent).toEqual(
        'test',
      );
    });
  });
});
