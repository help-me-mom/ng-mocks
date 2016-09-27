/* global window */
/* eslint no-console:0 */
window.module = {
    exports: {}
};

window.process = {
    env: {}
};

(function() {

    "use strict";

    var cachedModules = {};

    function resolveModule(dependency) {

        var paths = [dependency, dependency + ".js"];

        for (var i = 0; i < paths.length; i++) {

            if (window.__monounity_commonjs_modules__[paths[i]]) {

                return { module: window.__monounity_commonjs_modules__[paths[i]], path: paths[i] };
            }
        }
    }

    function getRequire(basepath) {
        return function(dependency) {
            return require(basepath, dependency);
        };
    }

    function runModule(moduleLoader, dependencyPath) {

        var module = cachedModules[dependencyPath];

        if (module === undefined) {

            module = { exports: {} };
            cachedModules[dependencyPath] = module;
            moduleLoader(getRequire(dependencyPath), module, module.exports);
        }

        return module.exports;
    }

    function require(requiringFile, dependency) {

        var resolvedModule = resolveModule(dependency);

        if (typeof resolvedModule.module === "function") {

            return runModule(resolvedModule.module, resolvedModule.path);
        }

        throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
    }

    for (var modulePath in window.__monounity_commonjs_modules__) {

        require(modulePath, modulePath);
    }

})();
