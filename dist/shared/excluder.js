"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash = require("lodash");
var PathTool = require("./path-tool");
var Excluder = (function () {
    function Excluder() {
    }
    Excluder.prototype.exclude = function (config) {
        //
    };
    Excluder.prototype.extend = function (key, a, b) {
        var list = lodash.union(a[key], b[key]);
        if (list && list.length) {
            a[key] = list.map(function (item) {
                return PathTool.fixWindowsPath(item);
            });
        }
    };
    return Excluder;
}());
exports.Excluder = Excluder;
