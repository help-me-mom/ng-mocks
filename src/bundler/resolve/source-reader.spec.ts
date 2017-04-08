import * as log4js from "log4js";
import * as mockfs from "mock-fs";
import * as test from "tape";

import { ConfigOptions } from "karma";

import { KarmaTypescriptConfig } from "../../api/configuration";
import { Configuration } from "../../shared/configuration";
import { Project } from "../../shared/project";
import { RequiredModule } from "../required-module";
import { Transformer } from "../transformer";
import { SourceReader } from "./source-reader";

let configuration = new Configuration({});
let project = new Project(configuration, log4js.getLogger("project"));
let transformer = new Transformer(configuration, log4js.getLogger("transformer"), project);
let sourceReader = new SourceReader(configuration, transformer);

let karmaTypescriptConfig: KarmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};

let karma: ConfigOptions = {};
(<any> karma).karmaTypescriptConfig = karmaTypescriptConfig;

configuration.initialize(karma);

mockfs({
    "dummy.js" : new Buffer("var x;"),
    "ignored.js" : new Buffer(""),
    "noparse.js" : new Buffer(""),
    "style.css" : new Buffer("")
});

test("source-reader should return an empty object literal for ignored modules", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("ignored", "ignored.js");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, "module.exports={};");
    });
});

test("source-reader should read source for module", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("dummy", "dummy.js");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, "var x;");
    });
});

test("source-reader should create an AST", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("dummy", "dummy.js");

    sourceReader.read(requiredModule, () => {
        t.notEqual(requiredModule.ast.body, undefined);
    });
});

test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("style", "style.css");

    sourceReader.read(requiredModule, () => {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});

test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("noparse", "noparse.js");

    sourceReader.read(requiredModule, () => {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});
