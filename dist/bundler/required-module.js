"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequiredModule = (function () {
    function RequiredModule(moduleName, filename, source, requiredModules) {
        if (requiredModules === void 0) { requiredModules = []; }
        this.moduleName = moduleName;
        this.filename = filename;
        this.source = source;
        this.requiredModules = requiredModules;
    }
    RequiredModule.prototype.isJson = function () {
        return this.filename && /\.json$/.test(this.filename);
    };
    RequiredModule.prototype.isNpmModule = function () {
        return this.moduleName.charAt(0) !== "." && this.moduleName.charAt(0) !== "/";
    };
    RequiredModule.prototype.isScript = function () {
        return this.filename && /\.(js|jsx|ts|tsx)$/.test(this.filename);
    };
    RequiredModule.prototype.isTypingsFile = function () {
        return this.filename && /\.d\.ts$/.test(this.filename);
    };
    RequiredModule.prototype.isTypescriptFile = function () {
        return this.filename && !this.isTypingsFile() && /\.(ts|tsx)$/.test(this.filename);
    };
    return RequiredModule;
}());
exports.RequiredModule = RequiredModule;
