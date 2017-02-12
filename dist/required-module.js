"use strict";
var RequiredModule = (function () {
    function RequiredModule(filename, moduleName) {
        this.filename = filename;
        this.moduleName = moduleName;
        this.isTypingsFile = filename && /\.d\.ts$/.test(filename);
        this.isTypescriptFile = filename && !this.isTypingsFile && /\.(ts|tsx)$/.test(filename);
    }
    return RequiredModule;
}());
module.exports = RequiredModule;
