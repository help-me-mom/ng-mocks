#!/bin/bash

# initialization
export IE_BIN="/c/Program Files/Internet Explorer/iexplore.exe"
cd /c/ && rm -Rf ng-mocks && mkdir ng-mocks && cd ng-mocks

find /z/ng-mocks/e2e/a5es5 -maxdepth 1 -not -name a5es5 -not -name node_modules -exec cp -r {} . \;

# installing dependencies
npm install --no-optional --ignore-scripts

# spreading tests
rm -Rf ./src/test && mkdir src/test && cp -r /z/ng-mocks/tests ./src/test && cp -r /z/ng-mocks/examples ./src/test
rm ./src/test/examples/TestRoutingGuard/test.spec.ts
rm ./src/test/examples/TestRoutingResolver/test.spec.ts

# spreading ng-mocks
rm -Rf ./node_modules/ng-mocks && cp -r /z/ng-mocks/dist/libs/ng-mocks ./node_modules

# running tests
npm run test:jasmine
