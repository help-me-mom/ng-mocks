// tslint:disable no-console no-var-requires no-require-imports max-func-body-length no-import-side-effect
// tslint:disable ordered-imports

import { Config } from 'karma';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite: any[] = [];
if (!process.env.KARMA_SUITE) {
  suite.push({
    pattern: './libs/ng-mocks/src/lib/**/*.ts',
    watched: false,
  });
  suite.push({
    pattern: './examples/**/*.ts',
    watched: false,
  });
  suite.push({
    pattern: './tests/**/*.ts',
    watched: false,
  });
} else if (process.env.KARMA_SUITE === 'perf') {
  suite.push({
    pattern: './tests-performance/**/*.ts',
    watched: false,
  });
} else {
  suite.push({
    pattern: process.env.KARMA_SUITE,
    watched: false,
  });
}

export default (config: Config) => {
  config.set({
    autoWatch: false,
    browsers: [process.env.IE_BIN ? 'IECi' : 'ChromeCi'],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
      },
    },
    colors: true,
    coverageIstanbulReporter: {
      dir: './test-reports/coverage',
      fixWebpackSourcePaths: true,
      reports: ['lcovonly', 'html'],
    },
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-infobars',
          '--disable-notifications',
          '--disable-translate',
          '--enable-logging=stderr',
          '--headless',
          '--mute-audio',
          '--no-sandbox',
          '--remote-debugging-address=0.0.0.0',
          '--remote-debugging-port=9222',
        ],
      },
      IECi: {
        base: 'IE',
        flags: ['-extoff'],
      },
    },
    files: [
      { pattern: './empty.ts', watched: false },
      { pattern: './karma-test-shim.ts', watched: false },
      {
        pattern: './libs/ng-mocks/src/index.ts',
        watched: false,
      },
      {
        pattern: './libs/ng-mocks/src/lib/**/!(*.spec|*.fixtures).ts',
        watched: false,
      },
      ...suite,
    ],
    frameworks: ['jasmine', 'webpack'],
    junitReporter: {
      outputDir: require('path').join(__dirname, './test-reports'),
      outputFile: 'specs-junit.xml',
      useBrowserName: false,
    },
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },
    reporters: ['dots', ...(process.env.WITH_COVERAGE === undefined ? [] : ['junit', 'coverage-istanbul'])],
    singleRun: true,
    webpack: {
      devtool: 'eval-source-map',
      module: {
        rules: [
          ...(process.env.WITH_COVERAGE === undefined
            ? []
            : [
                {
                  exclude: [/\.spec\.ts$/, /\.fixtures\.ts$/],
                  include: /\/libs\/ng-mocks\/src\//,
                  test: /\.tsx?$/,
                  use: {
                    loader: 'coverage-istanbul-loader',
                  },
                },
              ]),
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: './tsconfig.json',
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: ['.js', '.cjs', '.mjs', '.ts', '.json'],
        plugins: [
          new TsconfigPathsPlugin({
            configFile: './tsconfig.json',
          }),
        ],
      },
    },
    webpackMiddleware: {},
  });
};
