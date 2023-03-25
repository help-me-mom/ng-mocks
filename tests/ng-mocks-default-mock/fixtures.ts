import {
  Component,
  Directive,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ngMocks } from 'ng-mocks';

export const EMPTY = new Subject<any>();
EMPTY.complete();

export const NEVER = new Subject<any>();
NEVER.complete();

export const TOKEN = new InjectionToken('TOKEN');

@Injectable()
export class TargetService {
  public readonly name = 'TargetService';

  public echo(prefix?: string): string {
    return `${prefix}${this.name}`;
  }
}

@Injectable()
@Pipe({
  name: 'target',
})
export class TargetPipe implements PipeTransform {
  public o1$: Observable<number> = new Subject();

  public constructor(public readonly service: TargetService, @Inject(TOKEN) public readonly token: string) {}

  public getO1(): Observable<number> {
    return this.o1$;
  }

  public transform(value: string, param: boolean): string {
    return param ? `pipe:${value}` : '';
  }
}

@Component({
  selector: 'target-ng-mocks-default-mock',
  template: "{{ 'target' | target: true }}",
})
export class TargetComponent implements OnDestroy {
  public readonly destroy$ = new Subject<void>();
  public o2$: Observable<number> = new Subject();

  public constructor(
    public readonly service: TargetService,
    public readonly pipe: TargetPipe,
    @Inject(TOKEN) public readonly token: string,
  ) {
    this.service.echo(this.token);
    this.pipe.getO1().subscribe();
  }

  public getO2(): Observable<number> {
    return this.o2$;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Directive({
  selector: 'target-ng-mocks-default-mock',
})
export class TargetDirective implements OnDestroy {
  public readonly destroy$ = new Subject<void>();
  public o3$: Observable<number> = new Subject();

  public constructor(
    public readonly service: TargetService,
    public readonly pipe: TargetPipe,
    @Inject(TOKEN) public readonly token: string,
  ) {
    this.service.echo(this.token);
    this.pipe.getO1().subscribe();
  }

  public getO3(): Observable<number> {
    return this.o3$;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
  exports: [TargetComponent, TargetDirective, TargetPipe],
  providers: [
    TargetService,
    TargetPipe,
    {
      provide: TOKEN,
      useValue: 'token',
    },
  ],
})
export class TargetModule {}

ngMocks.defaultMock(TOKEN, () => 'mockToken');

ngMocks.defaultMock(TargetService, () => ({
  echo: () => 'mockEcho',
  name: 'mockName' as any,
}));

ngMocks.defaultMock(TargetPipe, (_, injector) => ({
  getO1: () => EMPTY,
  o1$: EMPTY,
  token: injector.get(TOKEN) as any,
  transform: (...args: any[]) => JSON.stringify(args),
}));

ngMocks.defaultMock(TargetComponent, (_, injector) => ({
  getO2: () => EMPTY,
  o2$: EMPTY,
  pipe: injector.get(TargetPipe),
  service: injector.get(TargetService),
  token: injector.get(TOKEN) as any,
}));

ngMocks.defaultMock(TargetDirective, (_, injector) => ({
  o3$: EMPTY,
  pipe: injector.get(TargetPipe),
  token: injector.get(TOKEN) as any,
}));

ngMocks.defaultMock(TargetDirective, (_, injector) => ({
  getO3: () => EMPTY,
  service: injector.get(TargetService),
}));
