import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'my',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class MyPipe implements PipeTransform {
  protected prefix = 'MyPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'keep',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class KeepPipe implements PipeTransform {
  protected prefix = 'KeepPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'mock',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class MockPipe implements PipeTransform {
  protected prefix = 'MockPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'customize',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class CustomizePipe implements PipeTransform {
  protected prefix = 'CustomizePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'restore',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class RestorePipe implements PipeTransform {
  protected prefix = 'RestorePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}
