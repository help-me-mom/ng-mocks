/* global window */
(function() {
    "use strict";
    var modules = {},
        fn = 0,
        id = 1,
        map = 2;
    function require(filename) {
        var wrapper,
            module = modules[filename];
        if (!module) {
            wrapper = window.wrappers[filename];
            if(!wrapper) {
                throw new Error("Not found: " + filename);
            }
            module = { exports: {}, id: wrapper[id], uri: filename };
            modules[filename] = module;
            wrapper[fn](function (dependency) {
                return require(wrapper[map][dependency]);
            }, module, module.exports, window, filename.slice(0, filename.lastIndexOf("/")), filename);
            if(module.exports && !module.exports.default && !module.isJSON && isExtensible(module.exports)) {
                module.exports.default = module.exports;
            }
        }
        return module.exports;
    }
    function isExtensible(obj) {
        return (typeof obj === "function" || typeof obj === "object") && Object.isExtensible(obj);
    }   
    (window.entrypointFilenames || []).forEach(function(filename) {
        require(filename);
    });
})();
