/* global window */
/* eslint no-console:0 */
window.process = {
    env: {}
};

window.global = {};

(function() {

    "use strict";

    var cachedModules = {};

    window.__monounity_commonjs_npm_alias_map__ = window.__monounity_commonjs_npm_alias_map__ || {};
    window.__monounity_commonjs_bootstrap_modules__ = window.__monounity_commonjs_bootstrap_modules__ || {};

    function resolveModule(requiringFile, dependency) {

        var absolutePath = getAbsolutePath(requiringFile, dependency),
            paths = [
                dependency,
                absolutePath,
                getModuleRelativeToNpm(requiringFile, dependency),
                absolutePath + ".js",
                absolutePath.replace(/\.(ts|tsx)$/, ".js") // import with file extension not allowed in Typescript 2+
            ];

        for (var i = 0; i < paths.length; i++) {

            if (window.__monounity_commonjs_modules__[paths[i]]) {

                return {
                    module: window.__monounity_commonjs_modules__[paths[i]],
                    path: paths[i]
                };
            }
        }

        handleModuleNotFound(requiringFile, dependency, paths);
    }

    function handleModuleNotFound(requiringFile, dependency, paths) {

        var pathsErrorMessage = "";

        paths.forEach(function(path){
            if(path) {
                pathsErrorMessage += "[" + path + "]\n";
            }
        });

        throw new Error("Could not find module \n\n'" +
            dependency + "' from\n\n'" +
            requiringFile + "' using paths\n\n" +
            pathsErrorMessage);
    }

    function getModuleRelativeToNpm(requiringFile, dependency) {

        var npmModulePath = window.__monounity_commonjs_npm_alias_map__[requiringFile];

        if(npmModulePath) {

            return npmModulePath ? getAbsolutePath(npmModulePath, dependency) : npmModulePath;
        }
    }

    function getRequire(basepath) {
        return function(dependency) {
            return require(basepath, dependency);
        };
    }

    function runModule(moduleLoader, dependencyPath) {

        var module = cachedModules[dependencyPath];

        if (!module) {

            module = { exports: {} };
            cachedModules[dependencyPath] = module;
            moduleLoader(getRequire(dependencyPath), module, module.exports);
        }

        return module.exports;
    }

    function require(requiringFile, dependency) {

        var resolvedModule = resolveModule(requiringFile, dependency);

        return runModule(resolvedModule.module, resolvedModule.path);
    }

    function getAbsolutePath(base, relative) {

        var stack = base.split("/"),
            parts = relative.split("/");

        stack.pop();

        for (var i = 0; i < parts.length; i++) {

            if (parts[i] === "."){
                continue;
            }

            if (parts[i] === ".."){
                stack.pop();
            }
            else {
                stack.push(parts[i]);
            }
        }

        return stack.join("/");
    }

    for (var modulePath in window.__monounity_commonjs_bootstrap_modules__) {

        require(modulePath, modulePath);
    }

})();
