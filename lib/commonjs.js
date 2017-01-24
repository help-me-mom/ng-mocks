(function(global) {
    "use strict";
    var modules = {},
        fn = 0,
        id = 1,
        map = 2;
    function require(filename, requiring, required) {
        var wrapper,
            module = modules[filename];
        if (!module) {
            wrapper = global.wrappers[filename];
            if(!wrapper) {
                throw new Error("Can't find " + required + " [" + filename + "] (required by " + requiring + ")");
            }
            module = { exports: {}, id: wrapper[id], uri: filename };
            modules[filename] = module;
            wrapper[fn].call(module.exports, function (dependency) {
                return require(wrapper[map][dependency], filename, dependency);
            }, module, module.exports, filename.slice(0, filename.lastIndexOf("/")), filename);
            if(module.exports && !module.exports.default && !module.isJSON && isExtensible(module.exports)) {
                Object.defineProperty(module.exports, "default", {
                    enumerable: false, configurable: true, writable: true, value: module.exports
                });
            }
        }
        return module.exports;
    }
    function isExtensible(obj) {
        return (typeof obj === "function" || typeof obj === "object") && Object.isExtensible(obj);
    }
    (global.entrypointFilenames || []).forEach(function(filename) {
        require(filename, filename, filename);
    });
})(this);