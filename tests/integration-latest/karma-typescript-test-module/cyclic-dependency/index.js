"use strict";

var a = require("./a.js");

exports.default = function () {
    return a;
}
  
module.exports = exports.default;