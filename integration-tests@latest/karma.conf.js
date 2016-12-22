module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/angular2/*.ts" },
            { pattern: "src/codemirror/*.ts" },
            { pattern: "src/compiler-paths/*.ts" },
            { pattern: "src/core-modules/*.ts" },
            { pattern: "src/cyclic/*.ts" },
            { pattern: "src/default-exports/*.ts" },
            { pattern: "src/angular2/*.ts" },
            { pattern: "src/formatting/*.ts" },
            { pattern: "src/imports/**/*.ts" },
            { pattern: "src/interface-mocking/*.ts" },
            { pattern: "src/json/*.ts" },
            { pattern: "src/module/*.ts" },
            { pattern: "src/no-module/*.ts" },
            { pattern: "src/node-globals/*.ts" },
            { pattern: "src/react-tsx/*.tsx" },
            { pattern: "src/relative-import-path/*.ts" },
            { pattern: "src/require/**/*.ts" },
            { pattern: "src/sinon/*.ts" },
            { pattern: "src/socket.io/*.ts" },
            { pattern: "src/style-import/*.ts" },
            { pattern: "src/typescript-language-features/*.ts" },
            { pattern: "src/x-performance/**/*.ts" }
        ],

        preprocessors: {
            "src/**/*.+(ts|tsx)": ["karma-typescript"]
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
                ignoredModuleNames: ["ws"]
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

        browsers: ["Chrome", "PhantomJS"]
    });
};
