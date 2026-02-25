import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'my',
  standalone: false,
})
export class MyPipe implements PipeTransform {
  protected prefix = 'MyPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'keep',
  standalone: false,
})
export class KeepPipe implements PipeTransform {
  protected prefix = 'KeepPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'mock',
  standalone: false,
})
export class MockPipe implements PipeTransform {
  protected prefix = 'MockPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'customize',
  standalone: false,
})
export class CustomizePipe implements PipeTransform {
  protected prefix = 'CustomizePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'restore',
  standalone: false,
})
export class RestorePipe implements PipeTransform {
  protected prefix = 'RestorePipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}
