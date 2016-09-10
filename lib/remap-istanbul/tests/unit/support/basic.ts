import * as has from './has';

export enum AType {
    A = 1,
    B,
    C,
    D
}

export class Foo {
    constructor (options: any) {
        for (let key in options) {
            (<any> this)[key] = options[key];
        }
    }
    bar: string = 'baz';
    private _args: any[] = [];
    method(...args: any[]): void {
        args.forEach((item) => {
            if (typeof item === 'object' || typeof item === 'function') {
                this._args.push(item);
            }
            else if (typeof item === 'string') {
                this._args.push(item);
            }
            else if (typeof item === 'number') {
                this._args.push(String(item));
            }
            else {
                this._args.push('something else');
            }
        });
    }
    ternary(value: any): string {
        return typeof value === 'object' ? 'isObject' : 'not object';
    }
    a: AType = AType.A;
}

let foo = new Foo({ bar: 'qat' });

export default foo;
