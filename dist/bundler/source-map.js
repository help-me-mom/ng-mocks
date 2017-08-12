"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
function createComment(file) {
    return "//# sourceMappingURL=" + path.basename(file.path) + ".map";
}
exports.createComment = createComment;
