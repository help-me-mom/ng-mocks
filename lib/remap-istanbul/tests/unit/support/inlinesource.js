(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
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
    exports.__esModule = true;
    exports["default"] = foo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW5saW5lc291cmNlLnRzIl0sIm5hbWVzIjpbIkFUeXBlIiwiRm9vIiwiRm9vLmNvbnN0cnVjdG9yIiwiRm9vLm1ldGhvZCIsIkZvby50ZXJuYXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUVBLFdBQVksS0FBSztRQUNiQSwyQkFBS0EsQ0FBQUE7UUFDTEEsMkJBQUNBLENBQUFBO1FBQ0RBLDJCQUFDQSxDQUFBQTtRQUNEQSwyQkFBQ0EsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUFMVyxhQUFLLEtBQUwsYUFBSyxRQUtoQjtJQUxELElBQVksS0FBSyxHQUFMLGFBS1gsQ0FBQTtJQUVEO1FBQ0lDLGFBQWFBLE9BQVlBO1lBS3pCQyxRQUFHQSxHQUFXQSxLQUFLQSxDQUFDQTtZQUNaQSxVQUFLQSxHQUFVQSxFQUFFQSxDQUFDQTtZQW9CMUJBLE1BQUNBLEdBQVVBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBekJmQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZkEsSUFBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLENBQUNBO1FBQ0xBLENBQUNBO1FBR0RELG9CQUFNQSxHQUFOQTtZQUFBRSxpQkFlQ0E7WUFmTUEsY0FBY0E7aUJBQWRBLFdBQWNBLENBQWRBLHNCQUFjQSxDQUFkQSxJQUFjQTtnQkFBZEEsNkJBQWNBOztZQUNqQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsSUFBSUE7Z0JBQ2RBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLEtBQUtBLFFBQVFBLElBQUlBLE9BQU9BLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO29CQUN6REEsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtnQkFDREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hDQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDMUJBLENBQUNBO2dCQUNEQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDaENBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsQ0FBQ0E7Z0JBQ0RBLElBQUlBLENBQUNBLENBQUNBO29CQUNGQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO2dCQUN0Q0EsQ0FBQ0E7WUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsQ0FBQ0E7UUFDREYscUJBQU9BLEdBQVBBLFVBQVFBLEtBQVVBO1lBQ2RHLE1BQU1BLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLEdBQUdBLFVBQVVBLEdBQUdBLFlBQVlBLENBQUNBO1FBQ2pFQSxDQUFDQTtRQUVMSCxVQUFDQTtJQUFEQSxDQUFDQSxBQTVCRCxJQTRCQztJQTVCWSxXQUFHLE1BNEJmLENBQUE7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRWxDO3lCQUFlLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGhhcyBmcm9tICcuL2hhcyc7XG5cbmV4cG9ydCBlbnVtIEFUeXBlIHtcbiAgICBBID0gMSxcbiAgICBCLFxuICAgIEMsXG4gICAgRFxufVxuXG5leHBvcnQgY2xhc3MgRm9vIHtcbiAgICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAoPGFueT4gdGhpcylba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBiYXI6IHN0cmluZyA9ICdiYXonO1xuICAgIHByaXZhdGUgX2FyZ3M6IGFueVtdID0gW107XG4gICAgbWV0aG9kKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGFyZ3MuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXRlbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FyZ3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FyZ3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FyZ3MucHVzaChTdHJpbmcoaXRlbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXJncy5wdXNoKCdzb21ldGhpbmcgZWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdGVybmFyeSh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyAnaXNPYmplY3QnIDogJ25vdCBvYmplY3QnO1xuICAgIH1cbiAgICBhOiBBVHlwZSA9IEFUeXBlLkE7XG59XG5cbmxldCBmb28gPSBuZXcgRm9vKHsgYmFyOiAncWF0JyB9KTtcblxuZXhwb3J0IGRlZmF1bHQgZm9vO1xuIl19