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
//# sourceMappingURL=data:text/plain;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmFzaWMudHMiXSwibmFtZXMiOlsiQVR5cGUiLCJGb28iLCJGb28uY29uc3RydWN0b3IiLCJGb28ubWV0aG9kIiwiRm9vLnRlcm5hcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBRUEsV0FBWSxLQUFLO1FBQ2JBLDJCQUFLQSxDQUFBQTtRQUNMQSwyQkFBQ0EsQ0FBQUE7UUFDREEsMkJBQUNBLENBQUFBO1FBQ0RBLDJCQUFDQSxDQUFBQTtJQUNMQSxDQUFDQSxFQUxXLGFBQUssS0FBTCxhQUFLLFFBS2hCO0lBTEQsSUFBWSxLQUFLLEdBQUwsYUFLWCxDQUFBO0lBRUQ7UUFDSUMsYUFBYUEsT0FBWUE7WUFLekJDLFFBQUdBLEdBQVdBLEtBQUtBLENBQUNBO1lBQ1pBLFVBQUtBLEdBQVVBLEVBQUVBLENBQUNBO1lBb0IxQkEsTUFBQ0EsR0FBVUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUF6QmZBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO2dCQUNmQSxJQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNyQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFHREQsb0JBQU1BLEdBQU5BO1lBQUFFLGlCQWVDQTtZQWZNQSxjQUFjQTtpQkFBZEEsV0FBY0EsQ0FBZEEsc0JBQWNBLENBQWRBLElBQWNBO2dCQUFkQSw2QkFBY0E7O1lBQ2pCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxJQUFJQTtnQkFDZEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3pEQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDMUJBLENBQUNBO2dCQUNEQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDaENBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUMxQkEsQ0FBQ0E7Z0JBQ0RBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUNoQ0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxDQUFDQTtnQkFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ0ZBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtZQUNMQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNQQSxDQUFDQTtRQUNERixxQkFBT0EsR0FBUEEsVUFBUUEsS0FBVUE7WUFDZEcsTUFBTUEsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsR0FBR0EsVUFBVUEsR0FBR0EsWUFBWUEsQ0FBQ0E7UUFDakVBLENBQUNBO1FBRUxILFVBQUNBO0lBQURBLENBQUNBLEFBNUJELElBNEJDO0lBNUJZLFdBQUcsTUE0QmYsQ0FBQTtJQUVELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFbEMsa0JBQWUsR0FBRyxDQUFDIn0=
