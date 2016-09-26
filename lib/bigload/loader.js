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

    function loadPaths(paths, existingfiles) {
        for (var i=0; i<paths.length; i++) {
            if (existingfiles[paths[i]]) {
                return {module: existingfiles[paths[i]], path: paths[i]};
            }
        }
    }

    function loadAsFile(dependency, existingfiles) {
        return loadPaths([dependency, dependency + ".js", dependency + ".json"], existingfiles);
    }

    function runModule(moduleFn, dependencyPath, requiringFilePath) {

        var module = cachedModules[dependencyPath];
        if (module === undefined) {
            module = { exports: {} };
            cachedModules[dependencyPath] = module;
            moduleFn(requireFn(dependencyPath), module, module.exports, dirname(requiringFilePath), basename(requiringFilePath));
        }

        return module.exports;
    }

    function require(requiringFile, dependency) {

        var resolvedModule = loadAsFile(dependency, window.__cjs_module__);

        if (resolvedModule && typeof resolvedModule.module === "function") {

            return runModule(resolvedModule.module, resolvedModule.path, requiringFile);
        }

        throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
    }

    function requireFn(basepath) {
        return function(dependency) {
            return require(basepath, dependency);
        };
    }

    function basename(path) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    function dirname(path) {
        return path.substring(0, path.lastIndexOf("/"));
    }

    for (var modulePath in window.__cjs_module__) {
        require(modulePath, modulePath);
    }

})(window);
