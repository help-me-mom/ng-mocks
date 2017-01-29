module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "base.spec.ts" },
            { pattern: "src/app/**/*.+(ts|html)" }
        ],

        proxies: {
            "/src/app/": "/base/src/app/"
            //"/app/": "/base/src/app/" // use this without moduleId + templateUrl: "app/hello.html"
        },

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: [process.env.TRAVIS ? "Chrome_travis_ci" : "Chrome"],

        // just some continous integration settings below, please disregard :)
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        }
    });
};
