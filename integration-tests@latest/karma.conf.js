module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "node_modules/reflect-metadata/Reflect.js" },
            { pattern: "node_modules/zone.js/dist/zone.js" },
            { pattern: "node_modules/zone.js/dist/long-stack-trace-zone.js" },
            { pattern: "node_modules/zone.js/dist/proxy.js" },
            { pattern: "node_modules/zone.js/dist/sync-test.js" },
            { pattern: "node_modules/zone.js/dist/jasmine-patch.js" },
            { pattern: "node_modules/zone.js/dist/async-test.js" },
            { pattern: "node_modules/zone.js/dist/fake-async-test.js" },
            { pattern: "src/angular2/*.ts" },
            { pattern: "src/codemirror/*.ts" },
            { pattern: "src/compiler-paths/*.ts" },
            { pattern: "src/core-modules/*.ts" },
            { pattern: "src/cyclic/*.ts" },
            { pattern: "src/default-exports/*.ts" },
            { pattern: "src/angular2/*.ts" },
            { pattern: "src/formatting/*.ts" },
            { pattern: "src/index-require/**/*.ts" },
            { pattern: "src/interface-mocking/*.ts" },
            { pattern: "src/json/*.+(ts|json)" },
            { pattern: "src/no-module/*.ts" },
            { pattern: "src/node-globals/*.ts" },
            { pattern: "src/react-tsx/*.tsx" },
            { pattern: "src/relative-import-path/*.ts" },
            { pattern: "src/require/*.ts" },
            { pattern: "src/sinon/*.ts" },
            { pattern: "src/style-import/*.ts" },
            { pattern: "src/typescript-language-features/*.ts" },
            { pattern: "src/x-performance/**/*.ts" }
        ],

        preprocessors: {
            "src/**/*.+(ts|tsx)": ["karma-typescript"],
            "src/**/*.json": ["karma-typescript-json"]
        },

        karmaTypescriptConfig: {
            tsconfig: "./tsconfig.json",
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                noImplicitAny: true,
                module: "commonjs",
                moduleResolution: "node",
                sourceMap: true,
                target: "ES5",
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["broken"],
            bundlerOptions: {
                ignoredModuleNames: ["react/addons"]
            },
            disableCodeCoverageInstrumentation: false,
            excludeFromCoverage: /\.(d|spec|test)\.ts/,
            reports:
            {
                "html": "coverage",
                "text-summary": ""
            },
            transformPath: function(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, ".js");
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
