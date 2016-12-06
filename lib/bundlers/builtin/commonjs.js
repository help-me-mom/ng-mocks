/* global window */
(function() {
    "use strict";
    var modules = {},
        fn = 0,
        map = 1;
    function require(filename) {
        var wrapper,
            module = modules[filename];
        if (!module) {
            module = { exports: {} };
            modules[filename] = module;
            wrapper = window.wrappers[filename];
            if(!wrapper) {
                throw new Error("Not found: " + filename);
            }
            wrapper[fn](function (dependency) {
                return require(wrapper[map][dependency]);
            }, module, module.exports, filename.slice(0, filename.lastIndexOf("/")), filename);
        }
        if(!module.exports.default && Object.isExtensible(module.exports)) {
            module.exports.default = module.exports;
        }
        return module.exports;
    }
    (window.filenames || []).forEach(function(filename) {
        require(filename);
    });
})();
