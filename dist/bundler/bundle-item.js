"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BundleItem = (function () {
    function BundleItem(moduleName, filename, source, dependencies) {
        if (dependencies === void 0) { dependencies = []; }
        this.moduleName = moduleName;
        this.filename = filename;
        this.source = source;
        this.dependencies = dependencies;
    }
    BundleItem.prototype.isNpmModule = function () {
        return this.moduleName.charAt(0) !== "." && this.moduleName.charAt(0) !== "/";
    };
    BundleItem.prototype.isScript = function () {
        return this.filename && /\.(js|jsx|ts|tsx)$/.test(this.filename);
    };
    BundleItem.prototype.isTypingsFile = function () {
        return this.filename && /\.d\.ts$/.test(this.filename);
    };
    BundleItem.prototype.isTypescriptFile = function () {
        return this.filename && !this.isTypingsFile() && /\.(ts|tsx)$/.test(this.filename);
    };
    return BundleItem;
}());
exports.BundleItem = BundleItem;
