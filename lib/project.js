function Project() {

    var glob = require("glob"),
        fs = require("fs"),
        path = require("path"),
        ts = require("typescript");

    function resolve(karmaConfig, log) {

        log.info("resolving %s", karmaConfig.basePath);

        var compilerOptions = resolveOptions(karmaConfig),
            defaultLibFilename = ts.getDefaultLibFilePath(compilerOptions),
            resolvedPaths = resolvePaths(karmaConfig, compilerOptions),
            files = {};

        if(!compilerOptions.noLib) {
            resolvedPaths.push(defaultLibFilename);
        }

        resolvedPaths.forEach(function(resolvedPath) {

            files[resolvedPath] = { version: 0, text: fs.readFileSync(resolvedPath).toString() };
        });

        log.info("resolved %s", karmaConfig.basePath);

        return {
            basePath: karmaConfig.basePath,
            files: files,
            defaultLibFilename: defaultLibFilename,
            options: compilerOptions
        };
    }

    function resolveOptions(karmaConfig) {

        // TODO: merge with config.karmaTypescript.tsconfigPath and config.karmaTypescript.compilerOptions
        karmaConfig = karmaConfig || {};

        return {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.React,
            noImplicitAny: true,
            experimentalDecorators: true,
            sourceMap: true
        };
    }

    function resolvePaths(karmaConfig){

        // TODO: resolve paths using project tsconfig from config.karmaTypescript.tsconfigPath
        // TODO: resolve types using project tsconfig.compilerOptions.types|typesRoot and/or
        //       typeFiles = glob.sync(config.basePath + "/node_modules/@types/**/*.d.ts"), for 2.0+

        return glob.sync(karmaConfig.basePath + "/!(node_modules)/**/*.+(ts|tsx)").filter(function(filename){
            return filename.indexOf("x-performance") === -1;
        });
    }

    this.resolve = resolve;
}

module.exports = Project;
