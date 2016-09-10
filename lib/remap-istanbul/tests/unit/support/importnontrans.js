(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './foo'], factory);
    }
})(function (require, exports) {
    var foo = require('./foo');
    var value = foo.foo();
    return function () {
        if (value) {
            console.log(value);
        }
        else {
            console.log('no value');
        }
    };
});
//# sourceMappingURL=importnontrans.js.map