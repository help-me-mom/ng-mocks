"use strict";
require("./style/css.css");
require("./style/css");
require("./style/less.less");
require("./style/less");
require("./style/sass.sass");
require("./style/sass");
require("./style/scss.scss");
require("./style/scss");
var StyleImportsComponent = (function () {
    function StyleImportsComponent() {
    }
    StyleImportsComponent.prototype.doSomething = function () {
        return "I didn't crash and burn!";
    };
    return StyleImportsComponent;
}());
exports.StyleImportsComponent = StyleImportsComponent;
//# sourceMappingURL=component.js.map