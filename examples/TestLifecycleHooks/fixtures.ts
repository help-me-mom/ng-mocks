import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';

// A dummy service we are going to replace with its mock copy and to use for assertions.
@Injectable()
export class TargetService {
  protected called = false;

  public afterContentChecked() {
    this.called = true;
  }

  public afterContentInit() {
    this.called = true;
  }

  public afterViewChecked() {
    this.called = true;
  }

  public afterViewInit() {
    this.called = true;
  }

  public ctor() {
    this.called = true;
  }

  public onChanges() {
    this.called = true;
  }

  public onDestroy() {
    this.called = true;
  }

  public onInit() {
    this.called = true;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-lifecycle-hooks',
  template: '',
})
export class TargetComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked
{
  @Input() public input: string | null = null;

  public constructor(protected readonly service: TargetService) {
    this.service.ctor();
  }

  public ngAfterContentChecked(): void {
    this.service.afterContentChecked();
  }

  public ngAfterContentInit(): void {
    this.service.afterContentInit();
  }

  public ngAfterViewChecked(): void {
    this.service.afterViewChecked();
  }

  public ngAfterViewInit(): void {
    this.service.afterViewInit();
  }

  public ngOnChanges(): void {
    this.service.onChanges();
  }

  public ngOnDestroy(): void {
    this.service.onDestroy();
  }

  public ngOnInit(): void {
    this.service.onInit();
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
export class TargetModule {}
