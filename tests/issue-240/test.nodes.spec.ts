import { TestBed } from '@angular/core/testing';

import { MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/240
describe('issue-240:nodes', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [ImpurePipe],
    }).compileComponents(),
  );

  it('calls pipes differently', () => {
    MockRender(
      `
        <div class="parent">
            "parent-1:{{ "parent-1" | impure }}"
            <div class="child-1">
                <!-- comment before -->
                "child-1:{{ "child-1" | impure }}"
            </div>
            <div class="child-2">
                "child-2:{{ "child-2" | impure }}"
                <!-- comment after -->
                <div class="child-3">
                    text before
                    "child-3:{{ "child-3" | impure }}"
                </div>
            </div>
            <ng-container>
                "parent-2:{{ "parent-2" | impure }}"
                <div class="obstacle"></div>
                <ng-container>
                    "parent-3:{{ "parent-3" | impure }}"
                    text after
                </ng-container>
            </ng-container>
        </div>
      `,
    );

    const parent = ngMocks.find('.parent');
    const child1 = ngMocks.find('.child-1');
    const child2 = ngMocks.find('.child-2');
    const child3 = ngMocks.find('.child-3');

    expect(parent.nativeElement.innerHTML).toContain(
      '"parent-1:ImpurePipe:parent-1"',
    );
    expect(parent.nativeElement.innerHTML).toContain(
      '"parent-2:ImpurePipe:parent-2"',
    );
    expect(parent.nativeElement.innerHTML).toContain(
      '"child-1:ImpurePipe:child-1"',
    );
    expect(parent.nativeElement.innerHTML).toContain(
      '"child-2:ImpurePipe:child-2"',
    );
    expect(parent.nativeElement.innerHTML).toContain(
      '"child-3:ImpurePipe:child-3"',
    );

    expect(child1.nativeElement.innerHTML).not.toContain(
      '"parent-1:ImpurePipe:parent-1"',
    );
    expect(child1.nativeElement.innerHTML).not.toContain(
      '"parent-2:ImpurePipe:parent-2"',
    );
    expect(child1.nativeElement.innerHTML).toContain(
      '"child-1:ImpurePipe:child-1"',
    );
    expect(child1.nativeElement.innerHTML).not.toContain(
      '"child-2:ImpurePipe:child-2"',
    );
    expect(child1.nativeElement.innerHTML).not.toContain(
      '"child-3:ImpurePipe:child-3"',
    );

    expect(child2.nativeElement.innerHTML).not.toContain(
      '"parent-1:ImpurePipe:parent-1"',
    );
    expect(child2.nativeElement.innerHTML).not.toContain(
      '"parent-2:ImpurePipe:parent-2"',
    );
    expect(child2.nativeElement.innerHTML).not.toContain(
      '"child-1:ImpurePipe:child-1"',
    );
    expect(child2.nativeElement.innerHTML).toContain(
      '"child-2:ImpurePipe:child-2"',
    );
    expect(child2.nativeElement.innerHTML).toContain(
      '"child-3:ImpurePipe:child-3"',
    );

    expect(child3.nativeElement.innerHTML).not.toContain(
      '"parent-1:ImpurePipe:parent-1"',
    );
    expect(child3.nativeElement.innerHTML).not.toContain(
      '"parent-2:ImpurePipe:parent-2"',
    );
    expect(child3.nativeElement.innerHTML).not.toContain(
      '"child-1:ImpurePipe:child-1"',
    );
    expect(child3.nativeElement.innerHTML).not.toContain(
      '"child-2:ImpurePipe:child-2"',
    );
    expect(child3.nativeElement.innerHTML).toContain(
      '"child-3:ImpurePipe:child-3"',
    );

    const parentPipes = ngMocks.findInstances(parent, ImpurePipe);
    expect(parentPipes.map(item => item.value)).toEqual([
      // all in the root node first
      'parent-1',
      'parent-2',
      'parent-3',
      'child-1',
      'child-2',
      'child-3',
    ]);

    const child1Pipes = ngMocks.findInstances(child1, ImpurePipe);
    expect(child1Pipes.map(item => item.value)).toEqual(['child-1']);

    const child2Pipes = ngMocks.findInstances(child2, ImpurePipe);
    expect(child2Pipes.map(item => item.value)).toEqual([
      'child-2',
      'child-3',
    ]);

    const child3Pipes = ngMocks.findInstances(child3, ImpurePipe);
    expect(child3Pipes.map(item => item.value)).toEqual(['child-3']);
  });
});
