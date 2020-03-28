// tslint:disable:max-classes-per-file

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
  public readonly parent: ServiceParent;

  constructor(parent: ServiceParent) {
    this.parent = parent;
  }
}
