const path = require('node:path');

const { BannerPlugin, Compilation } = require('webpack');

class AngularCommonJsOrderPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(AngularCommonJsOrderPlugin.name, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: AngularCommonJsOrderPlugin.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const source = compilation.getAsset('index.js')?.source.source().toString() ?? '';
          const coreTestingIndex = source.indexOf('@angular/core/testing');
          const commonIndex = source.indexOf('@angular/common');

          if (coreTestingIndex === -1 || commonIndex === -1 || coreTestingIndex > commonIndex) {
            throw new Error('index.js must load @angular/core/testing before @angular/common');
          }
        },
      );
    });
  }
}

const performance = {
  hints: 'error',
  maxAssetSize: 800 * 1024,
  maxEntrypointSize: 800 * 1024,
};

module.exports = [
  {
    mode: process.env.MODE || 'production',
    devtool: process.env.MODE ? false : 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es3'],
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.js',
      library: {
        type: 'umd',
      },
      globalObject: 'this',
    },
    externals: /^@angular\//,
    performance,
    plugins: [
      // The UMD external order is not stable across webpack versions. In CommonJS,
      // core/testing must register Angular's JIT facade before common is evaluated.
      new BannerPlugin({
        banner: "if (typeof exports === 'object' && typeof module === 'object') require('@angular/core/testing');",
        raw: true,
      }),
      new AngularCommonJsOrderPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  downlevelIteration: true,
                  ignoreDeprecations: '6.0',
                },
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.json'),
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.json'],
    },
  },
  {
    mode: process.env.MODE || 'production',
    devtool: process.env.MODE ? false : 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es2015'],
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.mjs',
      environment: {
        // Angular 14 can concatenate ESM package sources into one scope.
        // Generated lexical bindings would collide when the bundle is included more than once.
        const: false,
        let: false,
      },
      library: {
        type: 'module',
      },
      globalObject: 'this',
    },
    externals: /^@angular\//,
    performance,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.json'),
                compilerOptions: {
                  module: 'ES2015',
                  moduleResolution: 'bundler',
                  target: 'ES2015',
                },
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.json'],
    },
  },
];
