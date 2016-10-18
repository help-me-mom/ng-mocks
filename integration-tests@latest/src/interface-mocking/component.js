"use strict";
var Component = (function () {
    function Component(componentService) {
        this.componentService = componentService;
    }
    Component.prototype.sayHello = function () {
        return this.componentService.sayHello();
    };
    return Component;
}());
exports.Component = Component;
//# sourceMappingURL=component.js.map