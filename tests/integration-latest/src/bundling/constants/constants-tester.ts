declare var __STRING__: string;
declare var __BOOLEAN__: boolean;

export class ConstantsTester {

    public testString(): string {
        return __STRING__;
    }

    public testBoolean(): boolean {
        return __BOOLEAN__;
    }

    public testObject(): any {
        return process.env.VARIABLE;
    }
}
