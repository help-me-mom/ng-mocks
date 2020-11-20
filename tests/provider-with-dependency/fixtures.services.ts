import { Injectable } from '@angular/core';

@Injectable()
export class ServiceParent {
  protected value = 'parent';

  public echo() {
    return this.value;
  }
}

@Injectable()
export class ServiceReplacedParent extends ServiceParent {
  protected value = 'replaced';
}

@Injectable()
export class ServiceChild {
  public constructor(public readonly parent: ServiceParent) {}
}
