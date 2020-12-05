import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'my',
})
export class MyPipe implements PipeTransform {
  protected prefix = 'MyPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'keep',
})
export class KeepPipe implements PipeTransform {
  protected prefix = 'KeepPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'mock',
})
export class MockPipe implements PipeTransform {
  protected prefix = 'MockPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'customize',
})
export class CustomizePipe implements PipeTransform {
  protected prefix = 'CustomizePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'restore',
})
export class RestorePipe implements PipeTransform {
  protected prefix = 'RestorePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}
