(/* istanbul ignore next */ function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    (function (AType) {
        AType[AType["A"] = 1] = "A";
        AType[AType["B"] = 2] = "B";
        AType[AType["C"] = 3] = "C";
        AType[AType["D"] = 4] = "D";
    })(exports.AType || (exports.AType = {}));
    var AType = exports.AType;
    var Foo = (function () {
        function Foo(options) {
            this.bar = 'baz';
            this._args = [];
            this.a = AType.A;
            for (var key in options) {
                this[key] = options[key];
            }
        }
        Foo.prototype.method = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            args.forEach(function (item) {
                if (typeof item === 'object' || typeof item === 'function') {
                    _this._args.push(item);
                }
                else if (typeof item === 'string') {
                    _this._args.push(item);
                }
                else if (typeof item === 'number') {
                    _this._args.push(String(item));
                }
                else {
                    _this._args.push('something else');
                }
            });
        };
        Foo.prototype.ternary = function (value) {
            return typeof value === 'object' ? 'isObject' : 'not object';
        };
        return Foo;
    })();
    exports.Foo = Foo;
    var foo = new Foo({ bar: 'qat' });
    exports.default = foo;
});
//# sourceMappingURL=missingmap.js.map
