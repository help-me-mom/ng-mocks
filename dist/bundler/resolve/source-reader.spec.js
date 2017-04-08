"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var mockfs = require("mock-fs");
var test = require("tape");
var configuration_1 = require("../../shared/configuration");
var project_1 = require("../../shared/project");
var required_module_1 = require("../required-module");
var transformer_1 = require("../transformer");
var source_reader_1 = require("./source-reader");
var configuration = new configuration_1.Configuration({});
var project = new project_1.Project(configuration, log4js.getLogger("project"));
var transformer = new transformer_1.Transformer(configuration, log4js.getLogger("transformer"), project);
var sourceReader = new source_reader_1.SourceReader(configuration, transformer);
var karmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};
var karma = {};
karma.karmaTypescriptConfig = karmaTypescriptConfig;
configuration.initialize(karma);
mockfs({
    "dummy.js": new Buffer("var x;"),
    "ignored.js": new Buffer(""),
    "noparse.js": new Buffer(""),
    "style.css": new Buffer("")
});
test("source-reader should return an empty object literal for ignored modules", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("ignored", "ignored.js");
    sourceReader.read(requiredModule, function () {
        t.equal(requiredModule.source, "module.exports={};");
    });
});
test("source-reader should read source for module", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("dummy", "dummy.js");
    sourceReader.read(requiredModule, function () {
        t.equal(requiredModule.source, "var x;");
    });
});
test("source-reader should create an AST", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("dummy", "dummy.js");
    sourceReader.read(requiredModule, function () {
        t.notEqual(requiredModule.ast.body, undefined);
    });
});
test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("style", "style.css");
    sourceReader.read(requiredModule, function () {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});
test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("noparse", "noparse.js");
    sourceReader.read(requiredModule, function () {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});
