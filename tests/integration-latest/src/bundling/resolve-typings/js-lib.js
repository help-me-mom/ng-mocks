var SomeClass = (function () {
    function SomeClass() {
        //
    }
    SomeClass.prototype.sayHello = function () {
        return require("./hello").value;
    };
    return SomeClass;
}());

exports.jsLib = {
    SomeClass: SomeClass
};
