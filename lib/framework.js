var os = require("os");
var path = require("path");
var Promise = require("promise");

var donePromises = [];

var createFramework = function(config) {

    var moduleLoaderPattern = path.join(__dirname, "wideload/loader.js");

    config.files.push({ pattern: moduleLoaderPattern, included: true, served: true, watched: false });
    config.preprocessors[moduleLoaderPattern] = ["karma-typescript-wideload-preprocessor"];
};

var createWideLoadPreprocessor = function() {

    return function(content, file, done) {

        Promise.all(donePromises).then(function(){

            //console.log("wait for all promise fullfilled", result);

            for(var name in modules){

                //console.log("adding module", name);

                content = modules[name] + os.EOL + content;
            }

            done(null, content);
        });

        //console.log("created Promise.all", file.path);
    };
};

createWideLoadPreprocessor.$inject = [];

var fs = require("fs");
var coverage = require("karma-coverage");
var tsc = require("typescript");

var recast = require("recast");
var modules = {};

var log;
var config;
var specFileRegex = new RegExp(/\.(spec|test)\.ts/);
var transpiledFiles = {};

function hasPreprocessor(name) {

    for(var preprocessor in config.preprocessors) {

        if(config.preprocessors[preprocessor] && config.preprocessors[preprocessor].indexOf(name) !== -1) {

            return true;
        }
    }

    return false;
}

function hasCoverageReporter() {

    return config.reporters.indexOf("coverage") !== -1;
}

function getReporterArray(){

    var reporters;

    if(config.reporters) {

        reporters = config.reporters.slice();

        if(!hasCoverageReporter()){

            reporters.push("coverage");
        }
    }
    else {

        reporters = ["coverage"];
    }

    return reporters;
}

function getCoverageReporterConfig() {

    return config.coverageReporter || {
        instrumenterOptions: {
            istanbul: { noCompact: true }
        }
    };
}

function createSourcemap(file, content, transpileOutput){

    var result = transpileOutput.outputText,
        map,
        datauri;

    map = JSON.parse(transpileOutput.sourceMapText);
    map.sources[0] = path.basename(file.originalPath);
    map.sourcesContent = [content];
    map.file = path.basename(file.path);
    file.sourceMap = map;
    datauri = "data:application/json;charset=utf-8;base64," + new Buffer(JSON.stringify(map)).toString("base64");

    result = result.replace("//# sourceMappingURL=module.js.map", ""); // TODO: Is there a compiler option to disable this?
    result += "\n//# sourceMappingURL=" + datauri + "\n";

    return result;
}

function transpile(file, content){

    var transpileOutput = tsc.transpileModule(
            content, {
                compilerOptions: {
                    target: tsc.ScriptTarget.ES5,
                    module: tsc.ModuleKind.CommonJS,
                    jsx: tsc.JsxEmit.React,
                    sourceMap: true
                }
            }
        );

    return transpileOutput;
}

function chainPreprocessors(coveragePreprocessor, done, file, result) {

    if(specFileRegex.test(file.originalPath)) {

        log.debug("won't instrument spec file %s, done", file.originalPath);
        done(null, result);
    }
    else {

        if(hasPreprocessor("coverage")) {

            log.debug("karma-coverage configured, done");
            done(null, result);
        }
        else {

            coveragePreprocessor(result, file, function(instrumentedResult){

                done(null, instrumentedResult);
            });
        }
    }
}

var createPreprocessor = function(_config, helper, logger) {

    log = logger.create("preprocessor.karma-typescript");
    config = _config;

    log.info("Using Typescript %s", tsc.version);

    return function(content, file, done) {

        var result,
            transpileOutput,
            coveragePreprocessor = coverage["preprocessor:coverage"][1](
                logger,
                helper,
                config.basePath,
                getReporterArray(),
                getCoverageReporterConfig()
            ),
            donePromise = new Promise(function(resolve){
                try {

                    file.path = transformPath(file.originalPath);
                    transpileOutput = transpile(file, content);

                    result = createSourcemap(file, content, transpileOutput);

                    result = loadModules(file.path, result);

                    transpiledFiles[path.normalize(file.originalPath)] = result;

                    chainPreprocessors(coveragePreprocessor, done, file, result);

                    //console.log("resolving promise for ", file.path);
                    resolve(file.path);
                }
                catch(e) {

                    log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
                    done(e, null);
                }
            });

        donePromises.push(donePromise);

        //console.log("created promise for", file.path);

        log.debug("Processing \"%s\".", file.originalPath);
    };
};

createPreprocessor.$inject = ["config", "helper", "logger"];



/*
Highly experimental code below...
*/
/* eslint quotes:0 */
// var source = "(function (global, factory) {\n" +
// "    typeof exports === \"object\" && typeof module !== \"undefined\" ? factory(exports, require(\"rxjs/Subject\"), require(\"rxjs/Observable\")) :\n" +
// "    typeof define === \"function\" && define.amd ? define([\"exports\", \"rxjs/Subject\", \"rxjs/Observable\"], factory) :\n" +
// "    (factory((global.ng = global.ng || {}, global.ng.core = global.ng.core || {}),global.Rx,global.Rx));\n" +
// "})();";
/* eslint quotes:1 */

// var source = "module.exports = require('./lib/React'); /*require some stuff*/ while(true) { require('jasmine'); } var x = require('@angular/core'); require('style/scss'); function foo(x) { require('@types/jasmine'); } if(1){ var x = require('react'); }";
// var ast = recast.parse(source);
// console.log(ast.program.body[0].expression.callee);
// var requireExpressions = [];
// walkSyntaxTree(ast.program, requireExpressions);
// console.log(requireExpressions);
// console.log(recast.print(ast.code));

function walkSyntaxTree(node, requireExpressions) {

    if(isArray(node)) {

        node.forEach(function(statement){

            walkSyntaxTree(statement, requireExpressions);
        });
    }

    if(isObject(node)) {

        storeRequireExpression(node, requireExpressions);

        for(var key in node) {

            if(node.hasOwnProperty(key)) {

                walkSyntaxTree(node[key], requireExpressions);
            }
        }
    }
}

function storeRequireExpression(expression, requireExpressions) {

    if(expression && expression.arguments && expression.callee && expression.callee.name === "require") {

        requireExpressions.push(expression.arguments[0]);
    }
}

function isArray(obj) {

    return obj && Object.prototype.toString.call(obj) === "[object Array]";
}

function isObject(obj) {

    return obj && Object.prototype.toString.call(obj) === "[object Object]";
}

function loadModules(requiringModule, requiringModuleSource) {

    var ast = recast.parse(requiringModuleSource),
        requireExpressions = [];

    walkSyntaxTree(ast, requireExpressions);

    requireExpressions.forEach(function(requireExpression){

        try{
            var requiredModule = requireExpression.value,
                resolvedModule = resolveModule(requiringModule, requiredModule);

            requireExpression.value = resolvedModule.name;

            if(resolvedModule.loadContent && !modules[resolvedModule.name]){

                var moduleSource = fs.readFileSync(resolvedModule.path).toString();

                if(path.extname(resolvedModule.path) === ".js"){

                    var generatedSource = loadModules(resolvedModule.name, moduleSource);
                    modules[resolvedModule.name] = generatedSource;
                }
                else {
                    modules[resolvedModule.name] = addLoaderFunction(resolvedModule.name, "/* non-javascript content omitted */");
                }
            }
        }
        catch(error) {
            log.error(error.message, requiringModule);
        }
    });

    return addLoaderFunction(requiringModule, recast.print(ast).code);
}

function addLoaderFunction(moduleName, source) {

    return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
           "window.__monounity_commonjs_modules__['" + path.normalize(moduleName) + "'] = function moduleLoader(require, module, exports) { var __dirname = '" + moduleName + "'; " +
               source + os.EOL +
           "}";
}

function resolveModule(requiringModule, requiredModule) {

    if (isNpmModule(requiredModule)){

        return resolveNpmModule(requiredModule);
    }
    else {

        var relativePath = path.dirname(requiringModule),

            name = relativePath.endsWith("/node_modules") ?
                path.join(requiringModule, requiredModule) :
                path.join(relativePath, requiredModule),

            isRelativeToNpm = name.indexOf("/node_modules") !== -1,

            fullpath = isRelativeToNpm ? require.resolve(name) : resolveLocalModule(name);

        return {
            path: fullpath,
            name: assertModuleName(name),
            loadContent: isRelativeToNpm || path.extname(fullpath) !== ".js"
        };
    }
}

function isNpmModule(module) {

    return module.charAt(0) !== ".";
}

function resolveNpmModule(name) {

    var resolvedPath = require.resolve(name),
        moduleIndex = resolvedPath.lastIndexOf(path.join("node_modules", name)),
        moduleBasePath = resolvedPath.substring(0, moduleIndex);

    return {
        path: resolvedPath,
        name: path.join(path.normalize(moduleBasePath), "node_modules", name),
        loadContent: true
    };
}

function resolveLocalModule(name) {

    var directory = path.dirname(name),
        filenames = fs.readdirSync(directory),
        fullpath,
        fullpathMinusExtension,
        i;

    for(i = 0; i < filenames.length; i++) {

        fullpath = path.join(directory, filenames[i]);
        fullpathMinusExtension = fullpath.substring(0, fullpath.lastIndexOf("."));

        if(name === fullpath || name === fullpathMinusExtension) {

            return transformPath(fullpath);
        }
    }

    throw new Error("No file found for module " + name);
}

function assertModuleName(name) {

    return name.replace(/\.(ts|js)$/, "");
}

function transformPath(filepath) {

    return filepath.replace(/\.(ts|tsx)$/, ".js");
}

module.exports = {
    framework: createFramework,
    wideLoadPreprocessor: createWideLoadPreprocessor,
    preprocessor: createPreprocessor,
    transpiledFiles: transpiledFiles,
    modules: modules
};
