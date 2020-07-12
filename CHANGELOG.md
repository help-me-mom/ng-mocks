# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="10.0.1"></a>
## [10.0.1](https://github.com/ike18t/ng-mocks/compare/v10.0.0...v10.0.1) (2020-07-12)


### Bug Fixes

* building es5 only that supports es2015 ([d11ed5a](https://github.com/ike18t/ng-mocks/commit/d11ed5a)), closes [#158](https://github.com/ike18t/ng-mocks/issues/158)
* respect mocks in tokens with useValue ([ccccfc6](https://github.com/ike18t/ng-mocks/commit/ccccfc6)), closes [#151](https://github.com/ike18t/ng-mocks/issues/151)
* smart injection of NG_VALUE_ACCESSOR ([ad37bf0](https://github.com/ike18t/ng-mocks/commit/ad37bf0)), closes [#157](https://github.com/ike18t/ng-mocks/issues/157)



<a name="10.0.0"></a>
# [10.0.0](https://github.com/ike18t/ng-mocks/compare/v9.6.4...v10.0.0) (2020-07-05)


### Features

* angular 10 support ([83debd2](https://github.com/ike18t/ng-mocks/commit/83debd2)), closes [#148](https://github.com/ike18t/ng-mocks/issues/148) [#149](https://github.com/ike18t/ng-mocks/issues/149)


### BREAKING CHANGES

* A10



<a name="9.6.4"></a>
## [9.6.4](https://github.com/ike18t/ng-mocks/compare/v9.6.3...v9.6.4) (2020-07-02)


### Bug Fixes

* respect of WithProviders without providers ([11ec9de](https://github.com/ike18t/ng-mocks/commit/11ec9de)), closes [#151](https://github.com/ike18t/ng-mocks/issues/151)



<a name="9.6.3"></a>
## [9.6.3](https://github.com/ike18t/ng-mocks/compare/v9.6.2...v9.6.3) (2020-06-23)


### Bug Fixes

* adding NG_VALUE_ACCESSOR only when necessary ([7f54464](https://github.com/ike18t/ng-mocks/commit/7f54464)), closes [#145](https://github.com/ike18t/ng-mocks/issues/145)



<a name="9.6.2"></a>
## [9.6.2](https://github.com/ike18t/ng-mocks/compare/v9.6.1...v9.6.2) (2020-06-21)


### Bug Fixes

* detection of empty modules in mock process ([7427e29](https://github.com/ike18t/ng-mocks/commit/7427e29)), closes [#142](https://github.com/ike18t/ng-mocks/issues/142)



<a name="9.6.1"></a>
## [9.6.1](https://github.com/ike18t/ng-mocks/compare/v9.6.0...v9.6.1) (2020-06-14)


### Bug Fixes

* better default type of MockedComponentFixture ([cca6994](https://github.com/ike18t/ng-mocks/commit/cca6994))



<a name="9.6.0"></a>
# [9.6.0](https://github.com/ike18t/ng-mocks/compare/v9.5.0...v9.6.0) (2020-06-14)


### Features

* e2e tests for all angular versions ([7bc10a7](https://github.com/ike18t/ng-mocks/commit/7bc10a7))
* mock-builder + lots of helpers ([6965ec0](https://github.com/ike18t/ng-mocks/commit/6965ec0)), closes [#44](https://github.com/ike18t/ng-mocks/issues/44)
* mock-render tries to mirror passed component ([cbb37ba](https://github.com/ike18t/ng-mocks/commit/cbb37ba)), closes [#137](https://github.com/ike18t/ng-mocks/issues/137)



<a name="9.5.0"></a>
# [9.5.0](https://github.com/ike18t/ng-mocks/compare/v9.4.0...v9.5.0) (2020-05-31)


### Bug Fixes

* ngMocks instead of MockHelper ([1db914c](https://github.com/ike18t/ng-mocks/commit/1db914c)), closes [#131](https://github.com/ike18t/ng-mocks/issues/131)
* throw a human readable error during resolve ([284e848](https://github.com/ike18t/ng-mocks/commit/284e848)), closes [#133](https://github.com/ike18t/ng-mocks/issues/133)


### Features

* ease of getting inputs and outputs ([af9a846](https://github.com/ike18t/ng-mocks/commit/af9a846)), closes [#129](https://github.com/ike18t/ng-mocks/issues/129)
* mock-service is typed and supports overrides ([805e37b](https://github.com/ike18t/ng-mocks/commit/805e37b)), closes [#122](https://github.com/ike18t/ng-mocks/issues/122)



<a name="9.4.0"></a>
# [9.4.0](https://github.com/ike18t/ng-mocks/compare/v9.3.0...v9.4.0) (2020-05-17)


### Bug Fixes

* better docs with current features ([c76209f](https://github.com/ike18t/ng-mocks/commit/c76209f))


### Features

* original instanceof and properties ([05dd90b](https://github.com/ike18t/ng-mocks/commit/05dd90b)), closes [#109](https://github.com/ike18t/ng-mocks/issues/109)



<a name="9.3.0"></a>
# [9.3.0](https://github.com/ike18t/ng-mocks/compare/v9.2.0...v9.3.0) (2020-05-10)


### Bug Fixes

* correct mocking of xxxChild(ren) decorators ([de7b8c3](https://github.com/ike18t/ng-mocks/commit/de7b8c3)), closes [#109](https://github.com/ike18t/ng-mocks/issues/109)
* improved helpers and documentation ([9ef24a0](https://github.com/ike18t/ng-mocks/commit/9ef24a0))
* more friendly return type of mock-render ([f4a3b79](https://github.com/ike18t/ng-mocks/commit/f4a3b79))
* remove usage of uknown ([26dfdb8](https://github.com/ike18t/ng-mocks/commit/26dfdb8))


### Features

* MockHelper with find, findAll and OrFail ([ecc4ac7](https://github.com/ike18t/ng-mocks/commit/ecc4ac7))
* providers for MockRender ([cb656b7](https://github.com/ike18t/ng-mocks/commit/cb656b7)), closes [#102](https://github.com/ike18t/ng-mocks/issues/102)
* support to inject a library-related service mocker ([e6be694](https://github.com/ike18t/ng-mocks/commit/e6be694)), closes [#87](https://github.com/ike18t/ng-mocks/issues/87) [#103](https://github.com/ike18t/ng-mocks/issues/103)
* typecasted MockRender ([3bfe7bf](https://github.com/ike18t/ng-mocks/commit/3bfe7bf))



<a name="9.2.0"></a>
# 9.2.0 (2020-03-28)


### Bug Fixes

* respect of all parents ([b119547](https://github.com/ike18t/ng-mocks/commit/b119547))



<a name="9.1.0"></a>
# 9.1.0 (2020-03-21)


### Features

* Base class for directives and components ([f47853e](https://github.com/ike18t/ng-mocks/commit/f47853e))
* MockService ([62a87ea](https://github.com/ike18t/ng-mocks/commit/62a87ea))
* **mock-render:** option to detectChanges or not ([236b9e0](https://github.com/ike18t/ng-mocks/commit/236b9e0))



<a name="9.0.0"></a>
# 9.0.0 (2020-02-11)



<a name="8.1.0"></a>
# 8.1.0 (2019-07-17)


### Bug Fixes

* es2015 class declaration method mocking ([1286b10](https://github.com/ike18t/ng-mocks/commit/1286b10))



<a name="8.0.0"></a>
# 8.0.0 (2019-06-03)


### Features

* angular 8 ([29a5203](https://github.com/ike18t/ng-mocks/commit/29a5203))



<a name="7.8.0"></a>
# 7.8.0 (2019-05-14)


### Features

* **51:** Add mocked entry components to mocked modules ([a321b14](https://github.com/ike18t/ng-mocks/commit/a321b14))



<a name="7.7.2"></a>
## 7.7.2 (2019-04-26)



<a name="7.7.1"></a>
## 7.7.1 (2019-04-23)


### Bug Fixes

* **49:** stop caching mocked pipes ([058d66e](https://github.com/ike18t/ng-mocks/commit/058d66e))



<a name="7.7.0"></a>
# 7.7.0 (2019-03-15)



<a name="7.6.0"></a>
# 7.6.0 (2019-02-26)



<a name="7.5.0"></a>
# 7.5.0 (2019-01-29)



<a name="7.4.0"></a>
# 7.4.0 (2018-12-22)



<a name="7.3.0"></a>
# 7.3.0 (2018-12-18)



<a name="7.2.0"></a>
# 7.2.0 (2018-12-07)



<a name="7.1.3"></a>
## 7.1.3 (2018-12-02)



<a name="7.1.2"></a>
## 7.1.2 (2018-11-26)



<a name="7.1.1"></a>
## 7.1.1 (2018-11-06)



<a name="7.1.0"></a>
# 7.1.0 (2018-11-01)


### Bug Fixes

* trim innerText that was getting a new line from a div ([f883ad0](https://github.com/ike18t/ng-mocks/commit/f883ad0))



<a name="7.0.1"></a>
## 7.0.1 (2018-10-26)


### Bug Fixes

* package-lock out of sync ([6fe7d36](https://github.com/ike18t/ng-mocks/commit/6fe7d36))



<a name="7.0.0"></a>
# 7.0.0 (2018-10-26)



<a name="6.3.0"></a>
# 6.3.0 (2018-10-17)


### Features

* **MockDirective:** added the ability to use ViewChild/ViewChildren etc with MockDirective ([8853e87](https://github.com/ike18t/ng-mocks/commit/8853e87))



<a name="6.2.3"></a>
## 6.2.3 (2018-10-02)


### Bug Fixes

* **MockPlural:** removing generic type from MockComponents, Directives, and Pipes ([919a06c](https://github.com/ike18t/ng-mocks/commit/919a06c))



<a name="6.2.2"></a>
## 6.2.2 (2018-10-02)


### Bug Fixes

* **MockModule:** Never mock CommonModule ([119dd80](https://github.com/ike18t/ng-mocks/commit/119dd80))



<a name="6.2.1"></a>
## 6.2.1 (2018-08-28)



<a name="6.2.0"></a>
# 6.2.0 (2018-08-28)


### Features

* add a MockedComponent type ([fe547af](https://github.com/ike18t/ng-mocks/commit/fe547af))



<a name="6.1.0"></a>
# 6.1.0 (2018-06-04)


### Features

* support structural directives ([050e70c](https://github.com/ike18t/ng-mocks/commit/050e70c))



<a name="6.0.1"></a>
## 6.0.1 (2018-05-15)


### Bug Fixes

* package json peer dep version range ([8ad3834](https://github.com/ike18t/ng-mocks/commit/8ad3834))



<a name="6.0.0"></a>
# 6.0.0 (2018-05-14)


### Features

* support angular 6 and test 5 & 6 in travis ([5bc9331](https://github.com/ike18t/ng-mocks/commit/5bc9331))



<a name="5.3.0"></a>
# 5.3.0 (2018-04-05)


### Features

* MockOf - Include mocked class names in mock class names ([8b149f5](https://github.com/ike18t/ng-mocks/commit/8b149f5))



<a name="5.2.0"></a>
# 5.2.0 (2018-03-30)


### Features

* Use Angular annotation resolvers ([4050d10](https://github.com/ike18t/ng-mocks/commit/4050d10))



<a name="5.1.0"></a>
# 5.1.0 (2018-03-25)


### Bug Fixes

* Add a null check for decorator args ([1058044](https://github.com/ike18t/ng-mocks/commit/1058044))


### Features

* Support Angular propDecorators inputs and outputs ([add374d](https://github.com/ike18t/ng-mocks/commit/add374d))



<a name="5.0.0"></a>
# 5.0.0 (2018-03-25)


### Bug Fixes

* Fix bad return value from mock-directive ([4659a32](https://github.com/ike18t/ng-mocks/commit/4659a32))
* multiple decorators on an input ([13874b9](https://github.com/ike18t/ng-mocks/commit/13874b9))
* Outdated package-lock ([7623e98](https://github.com/ike18t/ng-mocks/commit/7623e98))


### Features

* add functions to mass mock ([fee5a03](https://github.com/ike18t/ng-mocks/commit/fee5a03))
* Cleanup exports and export MockDeclaration from MockModule ([9fe2bb1](https://github.com/ike18t/ng-mocks/commit/9fe2bb1))
* mock directives now have event emitter bound outputs ([bac1ca5](https://github.com/ike18t/ng-mocks/commit/bac1ca5))



<a name="5.0.0-rc5"></a>
# 5.0.0-rc5 (2018-03-07)


### Bug Fixes

* package json typings location ([5f6fde0](https://github.com/ike18t/ng-mocks/commit/5f6fde0))



<a name="5.0.0-rc4"></a>
# 5.0.0-rc4 (2018-03-07)



<a name="5.0.0-rc3"></a>
# 5.0.0-rc3 (2018-03-07)


### Bug Fixes

* integrate mock-pipe ([d747517](https://github.com/ike18t/ng-mocks/commit/d747517))
* mock_direcive integration ([7f02f7b](https://github.com/ike18t/ng-mocks/commit/7f02f7b))


### Features

* merge in mock-module ([05eaebe](https://github.com/ike18t/ng-mocks/commit/05eaebe))
* support inputs and outputs from extended components ([fc46838](https://github.com/ike18t/ng-mocks/commit/fc46838))



<a name="5.0.0-rc1"></a>
# 5.0.0-rc1 (2018-02-10)


### Bug Fixes

* add reflect-metadata back to devDeps ([385c9c4](https://github.com/ike18t/ng-mocks/commit/385c9c4))
* Add support for directives with a different kind of meta ([0bd38cc](https://github.com/ike18t/ng-mocks/commit/0bd38cc))
* add testbed test that exposed now fixed issue ([610cbdc](https://github.com/ike18t/ng-mocks/commit/610cbdc))
* forgot how to use js reduce ([de518d4](https://github.com/ike18t/ng-mocks/commit/de518d4))
* instantiate event emitters in component constructor ([fb4b97d](https://github.com/ike18t/ng-mocks/commit/fb4b97d))
* module exports is now all declarations ([fbb0e73](https://github.com/ike18t/ng-mocks/commit/fbb0e73))
* output binding ([59f476d](https://github.com/ike18t/ng-mocks/commit/59f476d))
* works with component w/o inputs or outputs ([b3d38e7](https://github.com/ike18t/ng-mocks/commit/b3d38e7))


### Features

* add exportAs and alias support ([14a1474](https://github.com/ike18t/ng-mocks/commit/14a1474))
* add support for exportAs and input aliases ([9b42a21](https://github.com/ike18t/ng-mocks/commit/9b42a21))
* Adding angular 2 compatibility and moving to peerDependency ([#3](https://github.com/ike18t/ng-mocks/issues/3)) ([4bd93db](https://github.com/ike18t/ng-mocks/commit/4bd93db))
* component mock implements control value accessor to support ngModel binding ([67ea7c4](https://github.com/ike18t/ng-mocks/commit/67ea7c4))
* initial implementation ([893f83b](https://github.com/ike18t/ng-mocks/commit/893f83b))
* memoize function by arg ([031e3a6](https://github.com/ike18t/ng-mocks/commit/031e3a6))
* memoize function by arg ([cac00b3](https://github.com/ike18t/ng-mocks/commit/cac00b3))
* mock module providers ([49b2272](https://github.com/ike18t/ng-mocks/commit/49b2272))
* Upgrade to angular 5 and pull in testbed for tests ([7df64a8](https://github.com/ike18t/ng-mocks/commit/7df64a8))
