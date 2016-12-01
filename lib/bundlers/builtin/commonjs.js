/* global window */

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
                absolutePath + "index.js",
                absolutePath + "/index.js"
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

        paths.forEach(function(path) {
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

    function getRequire(basepath, map) {

        var actualRequire = function(dependency) {

            return require(basepath, dependency);
        };

        //webpack require context stub
        actualRequire.context = function(directory, useSubdirectories, regExp) {

            var context = function(request) {
                return "";
            };

            context.keys = function() {
                return [];
            };

            context.resolve = function() {
                return "";
            };

            return context;
        };

        return actualRequire;
    }

    function runModule(module, dependencyPath) {

        var cachedModule = cachedModules[dependencyPath];

        if (!cachedModule) {

            cachedModule = { exports: {} };
            cachedModules[dependencyPath] = cachedModule;
            module.moduleLoader(getRequire(dependencyPath, module.map), cachedModule, cachedModule.exports);
        }

        return cachedModule.exports;
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

            if (parts[i] === ".") {
                continue;
            }

            if (parts[i] === "..") {
                stack.pop();
            }
            else {
                stack.push(parts[i]);
            }
        }

        return stack.join("/");
    }

    window.global = {};
    window.Buffer = require("buffer/", "buffer/").Buffer;
    window.process = require("process/browser", "process/browser");
    window.__DEV__ = true; // TODO: webpack hack...
    window.__TEST__ = true; // TODO: webpack hack...

    for (var modulePath in window.__monounity_commonjs_bootstrap_modules__) {

        require(modulePath, modulePath);
    }

})();
