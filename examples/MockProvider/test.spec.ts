import { CommonModule } from '@angular/common';
import { Component, Inject, Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

const UNK_TOKEN = new InjectionToken('UNK_TOKEN');
const STR_TOKEN = new InjectionToken<string>('STR_TOKEN');
const OBJ_TOKEN = new InjectionToken<{ name: string; value: number }>('OBJ_TOKEN');

@Injectable()
class Dependency1Service {
  public name = 'target';

  public echo(): string {
    return this.name;
  }
}

@Injectable()
class Dependency2Service {
  public name = 'target';

  public echo(): string {
    return this.name;
  }
}

@Component({
  selector: 'target',
  template: `"{{ dep1.name }}" "{{ dep2.name }}" "{{ unk }}" "{{ pri }}" "{{ str }}" "{{ obj | json }}"`,
})
class TargetComponent {
  public readonly dep1: Dependency1Service;
  public readonly dep2: Dependency2Service;
  public readonly obj: any;
  public readonly pri: string;
  public readonly str: string;
  public readonly unk: string;

  constructor(
    dep1: Dependency1Service,
    dep2: Dependency2Service,
    @Inject(UNK_TOKEN) unk: string,
    @Inject(STR_TOKEN) str: string,
    @Inject(OBJ_TOKEN) obj: any,
    @Inject('pri') pri: string
  ) {
    this.dep1 = dep1;
    this.dep2 = dep2;
    this.unk = unk;
    this.str = str;
    this.obj = obj;
    this.pri = pri;
  }
}

describe('MockProvider', () => {
  const mockObj = { value: 123 };

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [CommonModule],
      providers: [
        MockProvider(Dependency1Service),
        MockProvider(Dependency2Service, { name: 'd2:mock' }),
        MockProvider(UNK_TOKEN, 'mock token'),
        MockProvider(STR_TOKEN, 'mock'),
        MockProvider(OBJ_TOKEN, mockObj),
        MockProvider('pri', 'pri'),
      ],
    }).compileComponents()
  );

  it('uses mock providers', () => {
    // overriding the token's data that does affect the provided token.
    mockObj.value = 321;
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.injector.get(Dependency1Service).echo()).toBeUndefined();
    expect(fixture.debugElement.injector.get(Dependency2Service).echo()).toBeUndefined();
    expect(fixture.debugElement.injector.get(OBJ_TOKEN)).toBe(mockObj as any);
    expect(fixture.nativeElement.innerHTML).not.toContain('"target"');
    expect(fixture.nativeElement.innerHTML).toContain('"d2:mock"');
    expect(fixture.nativeElement.innerHTML).toContain('"mock token"');
    expect(fixture.nativeElement.innerHTML).toContain('"mock"');
    expect(fixture.nativeElement.innerHTML).toContain('"value": 321');
    expect(fixture.nativeElement.innerHTML).toContain('"pri"');
  });
});
