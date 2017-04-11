import * as kt from "karma-typescript/src/api/transforms";
import * as test from "tape";

import * as transform from "./transform";

let logOptions: kt.TransformInitializeLogOptions = {
    appenders: [{
        layout: {
            pattern: "%[%d{DATE}:%p [%c]: %]%m",
            type: "pattern"
        },
        type: "console"
    }],
    level: "INFO"
};

transform().initialize(logOptions);

// kt.TransformContext
/*
let createContext = (source: string): any => {
    return {
        config: {},
        filename: "file.css",
        module: "module",
        source
    };
};
*/

test("transformer should ...", (t) => {
    t.plan(1);
    t.assert(true);
});
