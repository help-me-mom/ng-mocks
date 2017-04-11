"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test = require("tape");
var transform = require("./transform");
var logOptions = {
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
test("transformer should ...", function (t) {
    t.plan(1);
    t.assert(true);
});
