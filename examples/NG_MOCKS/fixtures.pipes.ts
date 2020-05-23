import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'MyPipe',
})
export class MyPipe implements PipeTransform {
  protected prefix = 'MyPipe:';

  public transform(value: any, ...args: any[]): any {
    return this.prefix + value;
  }
}

@Pipe({
  name: 'PipeWeDontWantToMock',
})
export class PipeWeDontWantToMock implements PipeTransform {
  protected prefix = 'PipeWeDontWantToMock:';

  public transform(value: any, ...args: any[]): any {
    return this.prefix + value;
  }
}

@Pipe({
  name: 'PipeWeWantToMock',
})
export class PipeWeWantToMock implements PipeTransform {
  protected prefix = 'PipeWeWantToMock:';

  public transform(value: any, ...args: any[]): any {
    return this.prefix + value;
  }
}

@Pipe({
  name: 'PipeWeWantToCustomize',
})
export class PipeWeWantToCustomize implements PipeTransform {
  protected prefix = 'PipeWeWantToCustomize:';

  public transform(value: any, ...args: any[]): any {
    return this.prefix + value;
  }
}

@Pipe({
  name: 'PipeWeWantToRestore',
})
export class PipeWeWantToRestore implements PipeTransform {
  protected prefix = 'PipeWeWantToRestore:';

  public transform(value: any, ...args: any[]): any {
    return this.prefix + value;
  }
}
