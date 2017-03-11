"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var lodash = require("lodash");
var os = require("os");
var required_module_1 = require("./required-module");
var Globals = (function () {
    function Globals(config, resolver) {
        this.config = config;
        this.resolver = resolver;
    }
    Globals.prototype.add = function (buffer, entrypoints, onGlobalsAdded) {
        var _this = this;
        var items = [];
        this.addConstants(items);
        this.addNodeGlobals(items);
        async.eachSeries(items, function (item, onGlobalResolved) {
            async.eachSeries(item.requiredModules, function (dependency, onRequiredModuleResolved) {
                _this.resolver.resolveModule(item.filename, dependency, buffer, function () {
                    onRequiredModuleResolved();
                });
            }, function () {
                buffer.unshift(item);
                entrypoints.unshift(item.filename);
                onGlobalResolved();
            });
        }, function () {
            onGlobalsAdded();
        });
    };
    Globals.prototype.addNodeGlobals = function (items) {
        if (this.config.bundlerOptions.addNodeGlobals) {
            var name_1 = "bundle/node-globals";
            items.push(new required_module_1.RequiredModule(name_1, name_1, os.EOL + "global.process=require('process/browser');" +
                os.EOL + "global.Buffer=require('buffer/').Buffer;", [
                new required_module_1.RequiredModule("process/browser"),
                new required_module_1.RequiredModule("buffer/")
            ]));
        }
    };
    Globals.prototype.addConstants = function (items) {
        var _this = this;
        var source = "";
        var name = "bundle/constants";
        Object.keys(this.config.bundlerOptions.constants).forEach(function (key) {
            var value = _this.config.bundlerOptions.constants[key];
            if (!lodash.isString(value)) {
                value = JSON.stringify(value);
            }
            source += os.EOL + "global." + key + "=" + value + ";";
        });
        if (source) {
            items.push(new required_module_1.RequiredModule(name, name, source, []));
        }
    };
    return Globals;
}());
exports.Globals = Globals;
