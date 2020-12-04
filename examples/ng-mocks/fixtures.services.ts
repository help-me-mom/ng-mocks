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
export class ServiceWeDontWantToMimic {
  protected value = 'ServiceWeDontWantToMimic';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class ServiceWeWantToMimic {
  protected value = 'ServiceWeWantToMimic';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class ServiceWeWantToCustomize {
  protected value = 'ServiceWeWantToCustomize';

  public getName() {
    return this.value;
  }
}

@Injectable()
export class AnythingWeWant1 {
  protected value = 'AnythingWeWant1';

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
export class AnythingWeWant2 {
  protected value = 'AnythingWeWant2';

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
