"use strict";
var RequiredModule = (function () {
    function RequiredModule(moduleName, filename, source, requiredModules) {
        this.moduleName = moduleName;
        this.filename = filename;
        this.source = source;
        this.requiredModules = requiredModules;
        this.isTypingsFile = filename && /\.d\.ts$/.test(filename);
        this.isTypescriptFile = filename && !this.isTypingsFile && /\.(ts|tsx)$/.test(filename);
    }
    return RequiredModule;
}());
module.exports = RequiredModule;
