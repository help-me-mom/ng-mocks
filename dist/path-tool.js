"use strict";
function fixWindowsPath(value) {
    return value.replace(/\\/g, "/");
}
exports.fixWindowsPath = fixWindowsPath;
