import * as EffectsRunner from "@ngrx/effects/testing/";
import { D3Service } from "d3-ng2-service";
import forEach from "lodash-es/forEach";

export class Es6TransformTester {

    public testNgrxEffects(): string {
        // @ngrx/effects/testing/ has exports of type 'ExportAllDeclaration'
        return typeof EffectsRunner;
    }

    public testD3Ng2Service(): string {
        // d3-ng2-service has exports of type 'ExportAllDeclaration', imports of type ImportDeclaration
        return typeof D3Service;
    }

    public testLodashEs(): number {
        // lodash-es has exports of type ExportDefaultDeclaration, imports of type ImportDeclaration
        let last;

        forEach([1, 2, 3], (i) => {
            last = i;
        });

        return last;
    }

    public testDelay(): string {
        // delay has classes and consts, requires 'p-defer' which has nested consts
        let delay = require("delay");
        return typeof delay;
    }
}
