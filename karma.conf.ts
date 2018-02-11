// Karma configuration
// Generated on Mon Dec 25 2017 20:41:30 GMT-0800 (PST)

module.exports = (config: any) => {
  config.set({
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    colors: true,
    files: [
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',
      'karma-test-shim.ts',
      { pattern: 'lib/**/*.ts' }
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['dots', 'karma-typescript', 'kjhtml'],
    singleRun: true,

    karmaTypescriptConfig: {
      compilerOptions: {
        lib: ['ES2015', 'DOM']
      }
    }
  });
};
