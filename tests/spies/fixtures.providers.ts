import { Injectable } from '@angular/core';

@Injectable()
export class TargetService {
  protected value = 'TargetService';

  public echo(value?: string): string {
    return value ? value : this.value;
  }
}
