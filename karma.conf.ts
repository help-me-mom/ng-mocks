// tslint:disable-next-line:no-require-imports no-var-requires
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config: any) => {
  config.set({
    autoWatch: false,
    browsers: [process.env.IE_BIN ? 'IECi' : 'ChromeCi'],
    colors: true,
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
      IECi: {
        base: 'IE',
        flags: ['-extoff'],
      },
    },
    files: [
      'karma-test-shim.ts',
      'index.ts',
      'jasmine.ts',
      { pattern: 'lib/**/*.ts' },
      { pattern: 'examples/**/*.ts' },
      { pattern: 'tests/**/*.ts' },
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.ts': ['karma-typescript'],
    },
    reporters: ['kjhtml', 'karma-typescript'],
    singleRun: true,

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.spec.json',
    },
  });
};
