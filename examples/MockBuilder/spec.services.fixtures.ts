import { Injectable } from '@angular/core';

@Injectable()
export class MyService1 {
  protected value = 'MyService1';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class MyService2 {
  protected value = 'MyService2';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class ServiceKeep {
  protected value = 'serviceKeep';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class ServiceMock {
  protected value = 'serviceMock';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class ServiceCustomize {
  protected value = 'serviceCustomize';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class AnythingKeep1 {
  protected value = 'AnythingKeep1';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class TheSameAsAnyProvider {
  protected value = 'TheSameAsAnyProvider';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class AnythingKeep2 {
  protected value = 'AnythingKeep2';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class MyCustomProvider1 {
  protected value = 'MyCustomProvider1';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class MyCustomProvider2 {
  protected value = 'MyCustomProvider2';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class MyCustomProvider3 {
  protected value = 'MyCustomProvider3';

  public getName() {
    return this.value;
  }
}
