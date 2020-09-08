import * as module from "ambient";

export class AmbientModuleTester implements module.AmbientModule {
    public doSomething(): string {
        return "ambient";
    }
    public testAmbientModule() {
        return this.doSomething();
    }
}
