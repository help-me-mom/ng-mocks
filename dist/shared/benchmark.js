"use strict";
var Benchmark = (function () {
    function Benchmark() {
        this.start = process.hrtime();
    }
    Benchmark.prototype.elapsed = function () {
        var end = process.hrtime(this.start);
        return Math.round((end[0] * 1000) + (end[1] / 1000000));
    };
    return Benchmark;
}());
exports.Benchmark = Benchmark;
