import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
  private readonly name = 'app';

  public echo1(): string {
    return `${this.name}:1`;
  }

  public echo2(): string {
    return `${this.name}:2`;
  }

  public echo3(): string {
    return `${this.name}:3`;
  }
}
