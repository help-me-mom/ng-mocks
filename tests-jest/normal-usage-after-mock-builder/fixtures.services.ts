import { Injectable } from '@angular/core';

@Injectable()
export class TargetService {
  public called = 0;

  public call(): void {
    this.called += 1;
  }
}
