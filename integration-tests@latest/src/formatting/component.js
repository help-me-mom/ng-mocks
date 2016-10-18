"use strict";
/*
 * This comment should be left intact in the html coverage
 */
var FormattingComponent = (function () {
    function FormattingComponent() {
    }
    // Another comment, should not trip up the coverage remapping
    FormattingComponent.prototype.oneliner = function () { var greeting = "This one line function kept it's formatting!"; return greeting; };
    return FormattingComponent;
}());
exports.FormattingComponent = FormattingComponent;
//# sourceMappingURL=component.js.map