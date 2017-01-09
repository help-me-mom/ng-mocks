module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/bundling/**/*.ts" },
            { pattern: "src/custom-typings/**/*.ts" },
            { pattern: "src/exports/*.ts" },
            { pattern: "src/frameworks/**/*.ts" },
            { pattern: "src/imports/**/*.ts" },
            { pattern: "src/misc/no-module-tester.spec.ts" },
            { pattern: "src/misc/!(emptyfile)/**/*.ts" },
            { pattern: "src/node/**/*.ts" },
            { pattern: "src/typescript/**/*.ts" },
            { pattern: "src/x-performance/**/*.ts" }
        ],

        preprocessors: {
            "src/**/*.+(ts|tsx)": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                addNodeGlobals: true,
                exclude: ["react/addons"],
                ignore: ["ws"],
                noParse: ["jquery"],
                resolve: {
                    extensions: [".js", ".json"],
                    directories: ["node_modules"]
                },
                validateSyntax: false
            },
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                noImplicitAny: true,
                module: "commonjs",
                moduleResolution: "node",
                sourceMap: true,
                target: "ES5",
                lib: ["DOM", "ES5", "ScriptHost"]
            },
            coverageOptions: {
                instrumentation: true,
                exclude: /\.(d|spec|test)\.ts/
            },
            exclude: ["broken"],
            include: ["**/*.ts", "**/*.tsx"],
            reports: {
                "cobertura": {
                    "directory": "coverage",
                    "filename": "cobertura/coverage.xml"
                },
                "lcovonly": {
                    "directory": "coverage",
                    "filename": "lcovonly/lcov.info"
                },
                "html": "coverage",
                "text-summary": ""
            },
            transformPath: function(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, ".js");
            },
            tsconfig: "./tsconfig.json"
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome", "PhantomJS"]
    });
};
