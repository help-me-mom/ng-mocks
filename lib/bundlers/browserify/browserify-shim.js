/* global window */
/* eslint no-console:0 */

console.log("hello world!");

window.exports = {};
window.module = {
    exports: window.exports
};

window.require = function(name, jumped){

    console.log(name, jumped);
};
