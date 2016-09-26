/* global window */
/* eslint no-console:0 */
window.module = {
    exports: {}
};

window.process = {
    env: {}
};

// Copyright (c) 2013 Titanium I.T. LLC. Licensed under the MIT license.
(function() {
    "use strict";

    if (window.__cjs_module__ === undefined) throw new Error("Could not find any modules. Did you remember to set 'preprocessors' in your Karma config?");
    if (window.__cjs_modules_root__ === undefined) throw new Error("Could not find CommonJS module root path. Please report this issue to the karma-commonjs project.");

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

    function loadAsDirectory(dependency, existingfiles) {
        var pkgJsonPath = dependency + "/package.json";
        if (existingfiles[pkgJsonPath]) {
            return loadAsFile(normalizePath("", dependency + "/" + existingfiles[pkgJsonPath].main), existingfiles);
        }
        return loadPaths([dependency + "/index.js"], existingfiles);
    }

    function loadAsFileOrDirectory(dependency, existingfiles) {
        return loadAsFile(dependency, existingfiles) || loadAsDirectory(dependency, existingfiles);
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

        var resolvedModule, normalizedDepPath;
        var requiringPathEls;

        if (!isFullPath(requiringFile)) throw new Error("requiringFile path should be full path, but was [" + requiringFile + "]");

        if (isNpmModulePath(dependency)) {

            requiringPathEls = requiringFile.split("/");
            requiringPathEls.pop(); //cut of file part
            requiringPathEls.shift(); //cut of initial part coming from /

    //load from node_modules, traversing folders hierarchy up
            while (requiringPathEls.length && !resolvedModule) {
                normalizedDepPath = normalizePath("/" +requiringPathEls.join("/") + "/node_modules/file.js", dependency);
                resolvedModule = loadAsFileOrDirectory(normalizedDepPath, window.__cjs_module__);
                requiringPathEls.pop();
            }

    //as the last resort try out the configured modules root
            if (!resolvedModule) {
                normalizedDepPath = normalizePath(window.__cjs_modules_root__ + "/file.js", dependency);
                resolvedModule = loadAsFileOrDirectory(normalizedDepPath, window.__cjs_module__);
            }

        } else {
            normalizedDepPath = normalizePath(requiringFile, dependency);
            resolvedModule = loadAsFileOrDirectory(normalizedDepPath, window.__cjs_module__);
        }

        if (resolvedModule) {
            if (typeof resolvedModule.module === "function") {
                return runModule(resolvedModule.module, resolvedModule.path, requiringFile);
            } else {
                return resolvedModule.module; //assume it is JSON
            }
        } else {
    //none of the candidate paths was matching - throw
            throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
        }
    }

    function requireFn(basepath) {
        return function(dependency) {
            return require(basepath, dependency);
        };
    }

    function isFullPath(path) {
        var unixFullPath = (path.charAt(0) === "/");
        var windowsFullPath = (path.indexOf(":") !== -1);

        return unixFullPath || windowsFullPath;
    }

    function isNpmModulePath(path) {
        return !isFullPath(path) && path.charAt(0) != ".";
    }

    function normalizePath(basePath, relativePath) {

        if (isFullPath(relativePath)) {
            basePath = "";
        }

        var baseComponents = basePath.split("/");
        var relativeComponents = relativePath.split("/");
        var nextComponent;

  // remove file portion of basePath before starting
        baseComponents.pop();

        while (relativeComponents.length > 0) {
            nextComponent = relativeComponents.shift();

            if (nextComponent === ".") continue;
            else if (nextComponent === "..") baseComponents.pop();
    else baseComponents.push(nextComponent);
        }

        return baseComponents.join("/");
    }

    function basename(path) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    function dirname(path) {
        return path.substring(0, path.lastIndexOf("/"));
    }

	// load all modules, skip package.json
    for (var modulePath in window.__cjs_module__) {
        if (modulePath.indexOf("package.json", -12) === -1) {
            require(modulePath, modulePath);
        }
    }

})(window);
