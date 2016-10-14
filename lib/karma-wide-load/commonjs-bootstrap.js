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

    window.__monounity_commonjs_npm_map__ = window.__monounity_commonjs_npm_map__ || {};

    function resolveModule(requiringFile, dependency) {

        var absolutePath = getAbsolutePath(requiringFile, dependency),
            paths = [
                dependency,
                absolutePath,
                getModuleRelativeToNpm(requiringFile, dependency),
                absolutePath + ".js",
                absolutePath + ".css",
                absolutePath + ".less",
                absolutePath + ".sass",
                absolutePath + ".scss",
                absolutePath.replace(/\.(ts|tsx)$/, ".js")
            ],
            pathsErrorMessage = "";

        for (var i = 0; i < paths.length; i++) {

            if (window.__monounity_commonjs_modules__[paths[i]]) {

                return createModule(paths[i]);
            }
        }

        paths.forEach(function(path){
            if(path) {
                pathsErrorMessage += "[" + path + "]\n";
            }
        });

        throw new Error("Could not find module \n\n'" +
            dependency +"' from\n\n'" +
            requiringFile + "' using paths\n\n" +
            pathsErrorMessage);
    }

    function getModuleRelativeToNpm(requiringFile, dependency) {

        if(window.__monounity_commonjs_npm_map__[requiringFile]) {

            var npmModulePath = window.__monounity_commonjs_npm_map__[requiringFile];
            return getAbsolutePath(npmModulePath, dependency);
        }

        return undefined;
    }

    function createModule(path) {
        return {
            module: window.__monounity_commonjs_modules__[path],
            path: path
        };
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

        var resolvedModule = resolveModule(requiringFile, dependency);

        return runModule(resolvedModule.module, resolvedModule.path);
    }

    function getAbsolutePath(base, relative) {

        var stack = base.split(window.__monounity_commonjs_path_separator__),
            parts = relative.split(window.__monounity_commonjs_path_separator__);

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

        return stack.join(window.__monounity_commonjs_path_separator__);
    }

    for (var modulePath in window.__monounity_commonjs_modules__) {

        require(modulePath, modulePath);
    }

})();
