import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';

interface ViewVariables {
  clicked: boolean;
  stamp: number;
}

@Component({
  selector: 'app-root',
  // async pipe doesn't cause rerender
  template: `
    <div *ngIf="view$ | async as data">
      <div>-{{ cdrStamp() }}-</div>
      <div>{{ data.clicked | json }}@{{ data.stamp }}</div>

      <button (click)="click()">cause</button>
    </div>
  `,
})
export class AppComponent {
  constructor(private readonly cdr: ChangeDetectorRef, private readonly zone: NgZone) {}

  private readonly dataUpdate$ = new Subject<ViewVariables>();

  readonly view$ = this.dataUpdate$.pipe(
    startWith({
      clicked: false,
      stamp: 0,
    }),

    tap((data: any) => console.log('view$', data.stamp)),
    // solution I don't like
    // tap(() => setTimeout(() => this.cdr.detectChanges(), 0)),
  );

  cdrStamp(): number {
    console.log('cdrStamp', new Date());

    return 0;
  }

  click(): void {
    console.log('click');

    this.dataUpdate$.next({
      clicked: true,
      stamp: 0,
    } as any);

    // real app doesn't use this.zone.runOutsideAngular
    // it was added here in order to simulate an async
    // emit in this.dataUpdate$.
    setTimeout(() => {
      this.dataUpdate$.next({
        clicked: false,
        stamp: Date.now(),
      } as any);
    }, 1000);
  }
}
