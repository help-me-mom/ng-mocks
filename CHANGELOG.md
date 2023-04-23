# [14.10.0](https://github.com/ike18t/ng-mocks/compare/v14.9.0...v14.10.0) (2023-04-23)


### Bug Fixes

* **core:** better eval code to extend es6 classes [#5465](https://github.com/ike18t/ng-mocks/issues/5465) ([2dd66cd](https://github.com/ike18t/ng-mocks/commit/2dd66cd3b8d871e980629120ab974aacbe32ea1f))
* **MockBuilder:** touches kept modules in standalone components [#5520](https://github.com/ike18t/ng-mocks/issues/5520) ([1589172](https://github.com/ike18t/ng-mocks/commit/1589172358e9cb6beb3312c774f2423636766423))


### Features

* **core:** supporting functional guards and resolvers [#5455](https://github.com/ike18t/ng-mocks/issues/5455) ([d8a13c1](https://github.com/ike18t/ng-mocks/commit/d8a13c15adf4454074326af0acb8a1bc1ae93e94))

# [14.9.0](https://github.com/ike18t/ng-mocks/compare/v14.8.0...v14.9.0) (2023-04-15)


### Features

* **a16:** supporting required inputs [#5350](https://github.com/ike18t/ng-mocks/issues/5350) ([1303680](https://github.com/ike18t/ng-mocks/commit/1303680af24bedc503128b849e64d04b77cf9890))

# [14.8.0](https://github.com/ike18t/ng-mocks/compare/v14.7.3...v14.8.0) (2023-04-02)


### Features

* **core:** support of HostDirectives [#5117](https://github.com/ike18t/ng-mocks/issues/5117) ([b8414a4](https://github.com/ike18t/ng-mocks/commit/b8414a4515c8b7a9021c1a592ea30820818dbb2e))

## [14.7.3](https://github.com/ike18t/ng-mocks/compare/v14.7.2...v14.7.3) (2023-03-26)


### Bug Fixes

* **MockBuilder:** configuration first, process later [#5239](https://github.com/ike18t/ng-mocks/issues/5239) ([992ef6a](https://github.com/ike18t/ng-mocks/commit/992ef6a77b895918a3daeb031110deb19a3f90ea))
* **MockBuilder:** respects pipe-transform in early mocks [#5239](https://github.com/ike18t/ng-mocks/issues/5239) ([979d42b](https://github.com/ike18t/ng-mocks/commit/979d42bf668ee279a0f6dd9aed494095cc424573))

## [14.7.2](https://github.com/ike18t/ng-mocks/compare/v14.7.1...v14.7.2) (2023-03-25)


### Bug Fixes

* **core:** detecting self-references in mocks [#5262](https://github.com/ike18t/ng-mocks/issues/5262) ([c699d57](https://github.com/ike18t/ng-mocks/commit/c699d57fc77fc878986cddf33c18b4ac43539b3f))
* **core:** support of a16 [#5031](https://github.com/ike18t/ng-mocks/issues/5031) ([98bbc44](https://github.com/ike18t/ng-mocks/commit/98bbc441a3c1c8bb4dccd2348ac83e6468b75535))

## [14.7.1](https://github.com/ike18t/ng-mocks/compare/v14.7.0...v14.7.1) (2023-03-10)


### Bug Fixes

* **core:** removing dependency on ɵivyEnabled [#5118](https://github.com/ike18t/ng-mocks/issues/5118) ([ce2af65](https://github.com/ike18t/ng-mocks/commit/ce2af65f7dca853274434e5a06802e2aae53fb10))

# [14.7.0](https://github.com/ike18t/ng-mocks/compare/v14.6.0...v14.7.0) (2023-03-05)


### Bug Fixes

* **deps:** update nrwl monorepo to v15.8.5 ([f73f25a](https://github.com/ike18t/ng-mocks/commit/f73f25ac097e9892aec2c7c185f2677effc17df0))


### Features

* **ngMocks:** keep CommonModule [#5047](https://github.com/ike18t/ng-mocks/issues/5047) ([af1bd9e](https://github.com/ike18t/ng-mocks/commit/af1bd9e8808aa4e2520179a2a7a3abe3e2cd7bfc))

# [14.6.0](https://github.com/ike18t/ng-mocks/compare/v14.5.3...v14.6.0) (2023-01-21)


### Features

* **core:** ViewContainerRef.createComponent respects mocks [#4742](https://github.com/ike18t/ng-mocks/issues/4742) ([bd93b7b](https://github.com/ike18t/ng-mocks/commit/bd93b7b671306aa11e5732d0d72020e177330d52))

## [14.5.3](https://github.com/ike18t/ng-mocks/compare/v14.5.2...v14.5.3) (2023-01-15)


### Bug Fixes

* **MockBuilder:** precise exports via TestBed.configureTestingModule [#4641](https://github.com/ike18t/ng-mocks/issues/4641) ([66a8ecc](https://github.com/ike18t/ng-mocks/commit/66a8ecc403c1f1705e151eeb680b2b6552799e16))

## [14.5.2](https://github.com/ike18t/ng-mocks/compare/v14.5.1...v14.5.2) (2023-01-06)


### Bug Fixes

* **MockBuilder:** imports modules with providers on root level [#4613](https://github.com/ike18t/ng-mocks/issues/4613) ([3ed8ae4](https://github.com/ike18t/ng-mocks/commit/3ed8ae4d46bb5f56228175951331b2efb579a6cb))

## [14.5.1](https://github.com/ike18t/ng-mocks/compare/v14.5.0...v14.5.1) (2022-12-24)


### Bug Fixes

* **core:** correctly defines TestBed with multiple declarations with the same selector [#4564](https://github.com/ike18t/ng-mocks/issues/4564) ([1e01f82](https://github.com/ike18t/ng-mocks/commit/1e01f82714a6275b863f0f67046944d879250d16))
* **core:** respecting transform in mock pipes [#4564](https://github.com/ike18t/ng-mocks/issues/4564) ([df51240](https://github.com/ike18t/ng-mocks/commit/df51240f588eaed8bacae9d1863acc51bd439425))

# [14.5.0](https://github.com/ike18t/ng-mocks/compare/v14.4.0...v14.5.0) (2022-12-11)


### Features

* **core:** hidden usage of MockBuilder in TestBed if kept and mock modules are used together [#4344](https://github.com/ike18t/ng-mocks/issues/4344) ([d77b6f2](https://github.com/ike18t/ng-mocks/commit/d77b6f21abc8553540ae5087081669cb6d6b5890))
* **MockInstance:** ignores undefined properties [#4367](https://github.com/ike18t/ng-mocks/issues/4367) ([70d9781](https://github.com/ike18t/ng-mocks/commit/70d9781bf23843a8afa1fa507c8038520c527e50))

# [14.4.0](https://github.com/ike18t/ng-mocks/compare/v14.3.4...v14.4.0) (2022-11-27)


### Bug Fixes

* **a15:** adding NG_MOCKS_ROOT_PROVIDERS for RouteReuseStrategy ([737247d](https://github.com/ike18t/ng-mocks/commit/737247db1b1983d6319d7476ddcba5a5989683b7))
* **core:** correct caching of touched declarations [#4344](https://github.com/ike18t/ng-mocks/issues/4344) ([233f014](https://github.com/ike18t/ng-mocks/commit/233f014387993ad24c599cb433cf7dcaba01d75b))


### Features

* **MockBuilder:** mocks root providers via inject function [#4282](https://github.com/ike18t/ng-mocks/issues/4282) ([dc7026e](https://github.com/ike18t/ng-mocks/commit/dc7026e1431eabea1bcf2b27e511e99e51a5995c))

## [14.3.4](https://github.com/ike18t/ng-mocks/compare/v14.3.3...v14.3.4) (2022-11-22)


### Bug Fixes

* **core:** respecting schemas in mock modules [#4228](https://github.com/ike18t/ng-mocks/issues/4228) ([b13bf34](https://github.com/ike18t/ng-mocks/commit/b13bf340e93ac4aa64ba50cae380fa1f8be61595))
* **core:** support for EnvironmentProviders ([bcb8112](https://github.com/ike18t/ng-mocks/commit/bcb81123abcac3cf9f237c77d9a097084e46c8ca))

## [14.3.3](https://github.com/ike18t/ng-mocks/compare/v14.3.2...v14.3.3) (2022-11-12)

## [14.3.2](https://github.com/ike18t/ng-mocks/compare/v14.3.1...v14.3.2) (2022-10-30)


### Bug Fixes

* **MockRender:** respecting customizations for declarations without selectors [#4032](https://github.com/ike18t/ng-mocks/issues/4032) ([880f5dd](https://github.com/ike18t/ng-mocks/commit/880f5dd63a2468c148185bcd398c6ea231024ed0))

## [14.3.1](https://github.com/ike18t/ng-mocks/compare/v14.3.0...v14.3.1) (2022-10-23)


### Bug Fixes

* **a15:** supporting env provides [#3887](https://github.com/ike18t/ng-mocks/issues/3887) ([2769644](https://github.com/ike18t/ng-mocks/commit/2769644a545147ea57398c20ca1074a807ced5e4))

# [14.3.0](https://github.com/ike18t/ng-mocks/compare/v14.2.4...v14.3.0) (2022-10-13)


### Features

* **MockRender:** the host element doesn't have __ngContext__ attribute anymore [#3811](https://github.com/ike18t/ng-mocks/issues/3811) ([0138df7](https://github.com/ike18t/ng-mocks/commit/0138df747fc73608519a88d8ac6066a7d25fb69c))

## [14.2.4](https://github.com/ike18t/ng-mocks/compare/v14.2.3...v14.2.4) (2022-10-09)


### Bug Fixes

* **core:** exporting internal types [#3709](https://github.com/ike18t/ng-mocks/issues/3709) ([8b9cb23](https://github.com/ike18t/ng-mocks/commit/8b9cb2336ed21ae491a0ccd6e73486a7164df38c))
* **core:** providers with useExisting will be kept if their value is a kept declaration [#3778](https://github.com/ike18t/ng-mocks/issues/3778) ([4ef2885](https://github.com/ike18t/ng-mocks/commit/4ef2885ce873c3432dcc38e2a148969b60ffa430))

## [14.2.3](https://github.com/ike18t/ng-mocks/compare/v14.2.2...v14.2.3) (2022-09-24)


### Bug Fixes

* **MockBuilder:** better detection of provided dependencies [#3635](https://github.com/ike18t/ng-mocks/issues/3635) ([4e9aeab](https://github.com/ike18t/ng-mocks/commit/4e9aeab8fb553dd836675956f55479b722bdec30))
* **MockRender:** does not throw on standalone declarations [#3636](https://github.com/ike18t/ng-mocks/issues/3636) ([b2de841](https://github.com/ike18t/ng-mocks/commit/b2de841fe74685b93ad27511f35c7e4f778defbf))

## [14.2.2](https://github.com/ike18t/ng-mocks/compare/v14.2.1...v14.2.2) (2022-09-18)


### Bug Fixes

* **a15:** adding A15 support [#3495](https://github.com/ike18t/ng-mocks/issues/3495) ([f1125a7](https://github.com/ike18t/ng-mocks/commit/f1125a71cbe2bf18f3a7c16acf90ab3933fd9a67))

## [14.2.1](https://github.com/ike18t/ng-mocks/compare/v14.2.0...v14.2.1) (2022-09-09)


### Bug Fixes

* **core:** supports TS 4.8.3 [#3514](https://github.com/ike18t/ng-mocks/issues/3514) ([5b49b92](https://github.com/ike18t/ng-mocks/commit/5b49b92249a28c71038b3540f92197c3d3be88fc))
* **MockBuilder:** type of TestBed [#3466](https://github.com/ike18t/ng-mocks/issues/3466) ([6d8cef7](https://github.com/ike18t/ng-mocks/commit/6d8cef79cdfef529478893053592218999744a96))
* **ngMocks.faster:** support of angular 14.2.0 [#3466](https://github.com/ike18t/ng-mocks/issues/3466) ([5f893bb](https://github.com/ike18t/ng-mocks/commit/5f893bb98172eef78fab3aecb025159f1860cbfc))

# [14.2.0](https://github.com/ike18t/ng-mocks/compare/v14.1.3...v14.2.0) (2022-08-21)


### Features

* **ngMocks:** supports custom method names for change and touch [#3341](https://github.com/ike18t/ng-mocks/issues/3341) ([5068407](https://github.com/ike18t/ng-mocks/commit/5068407265531af88ad3d7679c7ef028965b1763))

## [14.1.3](https://github.com/ike18t/ng-mocks/compare/v14.1.2...v14.1.3) (2022-08-09)


### Bug Fixes

* **core:** generates compatible function names [#3274](https://github.com/ike18t/ng-mocks/issues/3274) ([3a1dfab](https://github.com/ike18t/ng-mocks/commit/3a1dfab358f581f121b78d1bd2f52b5b1ec0e5bd))

## [14.1.2](https://github.com/ike18t/ng-mocks/compare/v14.1.1...v14.1.2) (2022-08-07)


### Bug Fixes

* **MockBuilder:** respects initial config of declarations [#3265](https://github.com/ike18t/ng-mocks/issues/3265) ([1bea651](https://github.com/ike18t/ng-mocks/commit/1bea651e0f6d6199306d76bf76d7a8559ec9361d))

## [14.1.1](https://github.com/ike18t/ng-mocks/compare/v14.1.0...v14.1.1) (2022-07-31)


### Bug Fixes

* **MockBuilder:** respects global configuration for standalone dependencies [#3161](https://github.com/ike18t/ng-mocks/issues/3161) ([577e1d4](https://github.com/ike18t/ng-mocks/commit/577e1d4541a2fb928414ff3bb49fa9310790e773))

# [14.1.0](https://github.com/ike18t/ng-mocks/compare/v14.0.2...v14.1.0) (2022-07-15)


### Bug Fixes

* **core:** detecting and mocking standalone directives correctly [#3100](https://github.com/ike18t/ng-mocks/issues/3100) ([560b334](https://github.com/ike18t/ng-mocks/commit/560b33435279b0694ea6a941ca45ffb7af24a404))
* **core:** preventing recursion of self pointers [#3095](https://github.com/ike18t/ng-mocks/issues/3095) ([793a3c5](https://github.com/ike18t/ng-mocks/commit/793a3c53700f21f31bccca7d3df3c56f0cfbd6be))


### Features

* **MockRender:** supports Self providers [#3053](https://github.com/ike18t/ng-mocks/issues/3053) ([c455e25](https://github.com/ike18t/ng-mocks/commit/c455e25ee6000c8f786667e4a763bdfc1e7f6990))

## [14.0.2](https://github.com/ike18t/ng-mocks/compare/v14.0.1...v14.0.2) (2022-07-11)

* Moved to [help-me-mom](https://github.com/help-me-mom) organization on GitHub

## [14.0.1](https://github.com/help-me-mom/ng-mocks/compare/v14.0.0...v14.0.1) (2022-06-19)


### Bug Fixes

* **core:** provide mjs in package.json [#2846](https://github.com/help-me-mom/ng-mocks/issues/2846) ([1d007dd](https://github.com/help-me-mom/ng-mocks/commit/1d007dd282db7cd35e7c12548ca5f5f0e7d77fb9))
* **MockBuilder:** add undecorated classes to providers [#2845](https://github.com/help-me-mom/ng-mocks/issues/2845) ([29b6591](https://github.com/help-me-mom/ng-mocks/commit/29b6591e93512bcf109151925f92615968e4f9b4))

# [14.0.0](https://github.com/help-me-mom/ng-mocks/compare/v13.5.2...v14.0.0) (2022-06-18)


### Bug Fixes

* **MockBuilder:** respect extention of classes with different decorators [#2646](https://github.com/help-me-mom/ng-mocks/issues/2646) ([d069a90](https://github.com/help-me-mom/ng-mocks/commit/d069a9047cc3188bea384632ffa1d3a0a62a09da))


### Features

* **core:** Support of standalone declarations [#2687](https://github.com/help-me-mom/ng-mocks/issues/2687) ([797cec3](https://github.com/help-me-mom/ng-mocks/commit/797cec34c9afa94298fdfa3a971d92d54439969b))
* **MockBuilder:** default flags as dependency or export [#2647](https://github.com/help-me-mom/ng-mocks/issues/2647) ([f37a663](https://github.com/help-me-mom/ng-mocks/commit/f37a663761ec7a5cc122661cb91b6b82f99b5ed4))


### BREAKING CHANGES

* **MockBuilder:** MockBuilder with 2 params marks all chain calls as dependency
* **MockBuilder:** MockBuilder with 0-1 params marks all chain calls as export

## [13.5.2](https://github.com/help-me-mom/ng-mocks/compare/v13.5.1...v13.5.2) (2022-05-14)


### Bug Fixes

* **core:** correct type for AbstractType ([6fbf18d](https://github.com/help-me-mom/ng-mocks/commit/6fbf18d746c8cea5d284dfd9abbf5fbb51ac17eb))
* **core:** using this as global object ([5d21523](https://github.com/help-me-mom/ng-mocks/commit/5d21523ce03aa6c0a10cf69b564d3c030964d1ae))

## [13.5.1](https://github.com/help-me-mom/ng-mocks/compare/v13.5.0...v13.5.1) (2022-05-07)


### Bug Fixes

* **MockRender:** renders pipes with $implicit param [#2398](https://github.com/help-me-mom/ng-mocks/issues/2398) ([03f5f5e](https://github.com/help-me-mom/ng-mocks/commit/03f5f5e944cb7b4dedbdd8bf0e5e380bfbfc1257))

# [13.5.0](https://github.com/help-me-mom/ng-mocks/compare/v13.4.2...v13.5.0) (2022-05-01)


### Bug Fixes

* **ngMocks.findInstance:** finds pipes in attributes [#2314](https://github.com/help-me-mom/ng-mocks/issues/2314) ([1b8868f](https://github.com/help-me-mom/ng-mocks/commit/1b8868f21cd01f9aaa65ed0a5273e6f5a62c2228))
* **ngMocks.findInstance:** works without fixture [#2311](https://github.com/help-me-mom/ng-mocks/issues/2311) ([7752914](https://github.com/help-me-mom/ng-mocks/commit/7752914d9574cce447559c7196764ab484769fa1))


### Features

* **MockProvider:** simple generators for different types [#599](https://github.com/help-me-mom/ng-mocks/issues/599) ([9d90121](https://github.com/help-me-mom/ng-mocks/commit/9d90121faea5e70d679d5fb9b2c1e4a4a7345232))

## [13.4.2](https://github.com/help-me-mom/ng-mocks/compare/v13.4.1...v13.4.2) (2022-04-11)


### Bug Fixes

* exporting package.json ([4441f59](https://github.com/help-me-mom/ng-mocks/commit/4441f595cc407052f5b843fbb1127f43c122550f))

## [13.4.2-alpha.1](https://github.com/help-me-mom/ng-mocks/compare/v13.4.1...v13.4.2-alpha.1) (2022-04-11)


### Bug Fixes

* exporting package.json ([4441f59](https://github.com/help-me-mom/ng-mocks/commit/4441f595cc407052f5b843fbb1127f43c122550f))

## [13.4.1](https://github.com/help-me-mom/ng-mocks/compare/v13.4.0...v13.4.1) (2022-04-10)


### Bug Fixes

* **core:** exporting types in package.json [#2198](https://github.com/help-me-mom/ng-mocks/issues/2198) ([63d0516](https://github.com/help-me-mom/ng-mocks/commit/63d05164a817b497fc00e000b8ac80924f3c8d61))

# [13.4.0](https://github.com/help-me-mom/ng-mocks/compare/v13.3.0...v13.4.0) (2022-04-03)


### Bug Fixes

* **a14:** injecting mock components in vcr.createComponent [#333](https://github.com/help-me-mom/ng-mocks/issues/333) ([f3e5fd9](https://github.com/help-me-mom/ng-mocks/commit/f3e5fd97faa51fbcea070717085eb7ed8ae3abd0))
* **core:** BrowserAnimationsModule is optional dependency now [#1377](https://github.com/help-me-mom/ng-mocks/issues/1377) ([6f4e8da](https://github.com/help-me-mom/ng-mocks/commit/6f4e8da2b526d1095307ac84200143a9df379cce))
* **core:** removing isNgModuleDefWithProviders from exports [#2173](https://github.com/help-me-mom/ng-mocks/issues/2173) ([7501dc9](https://github.com/help-me-mom/ng-mocks/commit/7501dc9912bc88c89688ab48ff4c0987b26172a6))


### Features

* **core:** BrowserAnimationsModule better coverage [#1377](https://github.com/help-me-mom/ng-mocks/issues/1377) ([a2eaf88](https://github.com/help-me-mom/ng-mocks/commit/a2eaf8897b9dc6ad0a4108c24dd995f589d5fd63))

# [13.3.0](https://github.com/help-me-mom/ng-mocks/compare/v13.2.0...v13.3.0) (2022-03-27)


### Bug Fixes

* **core:** better error messages [#1168](https://github.com/help-me-mom/ng-mocks/issues/1168) ([cad1efb](https://github.com/help-me-mom/ng-mocks/commit/cad1efb215c888b6e639181bd67c0a8dcf495381))
* **ngMocks.stubMember:** forwarding stub values to point.componentInstance [#1165](https://github.com/help-me-mom/ng-mocks/issues/1165) ([3450e1d](https://github.com/help-me-mom/ng-mocks/commit/3450e1d8607f5233e51f99c471de8daaca86a6f3))


### Features

* **ngMocks.findInstance:** looks for instances in all matched DebugElements [#2105](https://github.com/help-me-mom/ng-mocks/issues/2105) ([bb39517](https://github.com/help-me-mom/ng-mocks/commit/bb39517dc7a69b709e3933e56c4b89aa6da26524))
* **ngMocks.findInstance:** supports tokens [#2097](https://github.com/help-me-mom/ng-mocks/issues/2097) ([9387209](https://github.com/help-me-mom/ng-mocks/commit/9387209d3f86ec474c449138a98d143a2b637482))


### Performance Improvements

* optimizing detection of global overrides [#1452](https://github.com/help-me-mom/ng-mocks/issues/1452) ([691a5c0](https://github.com/help-me-mom/ng-mocks/commit/691a5c0a297d058b6f660df31e76ab9c83038e5b))

# [13.2.0](https://github.com/help-me-mom/ng-mocks/compare/v13.1.1...v13.2.0) (2022-03-20)


### Bug Fixes

* **MockInstance:** correctly accepts falsy values [#2087](https://github.com/help-me-mom/ng-mocks/issues/2087) ([8900fc3](https://github.com/help-me-mom/ng-mocks/commit/8900fc37c6e6898a12908a8b00d73e01678f77fd))


### Features

* **ngMocks.defaultConfig:** config for MockBuilder [#971](https://github.com/help-me-mom/ng-mocks/issues/971) ([9415f57](https://github.com/help-me-mom/ng-mocks/commit/9415f571e0afd400495b9a6cb2f23c0c6ba281ce))

## [13.1.1](https://github.com/help-me-mom/ng-mocks/compare/v13.1.0...v13.1.1) (2022-03-12)


### Bug Fixes

* **a14:** adding a14 to peerDependencies ([e76b644](https://github.com/help-me-mom/ng-mocks/commit/e76b64413be8a58992ec546495a6f7c96ae26b18))
* **core:** generic in getMockedNgDefOf [#985](https://github.com/help-me-mom/ng-mocks/issues/985) ([567908d](https://github.com/help-me-mom/ng-mocks/commit/567908df9611781e6a7adfa3dfb84ed9f7e9e996))

# [13.1.0](https://github.com/help-me-mom/ng-mocks/compare/v13.0.4...v13.1.0) (2022-03-06)


### Bug Fixes

* **core:** mocking viewProviders [#1507](https://github.com/help-me-mom/ng-mocks/issues/1507) ([421c473](https://github.com/help-me-mom/ng-mocks/commit/421c473c3206ff8c01c4ea59ed3f5720d0826f18))


### Features

* **MockInstance:** resets root overrides likewise properties [#1256](https://github.com/help-me-mom/ng-mocks/issues/1256) ([a903556](https://github.com/help-me-mom/ng-mocks/commit/a903556c7aa5c101cf44a3c1f6d20a92e5c74698))

## [13.0.4](https://github.com/help-me-mom/ng-mocks/compare/v13.0.3...v13.0.4) (2022-02-27)


### Bug Fixes

* **a14:** root providers for ApplicationModule [#1932](https://github.com/help-me-mom/ng-mocks/issues/1932) ([fef7692](https://github.com/help-me-mom/ng-mocks/commit/fef769201b37b260c4a4029cba85c8efb079b90e))

## [13.0.3](https://github.com/help-me-mom/ng-mocks/compare/v13.0.2...v13.0.3) (2022-02-20)


### Bug Fixes

* **mock-render:** apply overrides to components with no selectors [#1876](https://github.com/help-me-mom/ng-mocks/issues/1876) ([b032746](https://github.com/help-me-mom/ng-mocks/commit/b032746161e307000afb8bafc368ae0d655c9c81))

## [13.0.2](https://github.com/help-me-mom/ng-mocks/compare/v13.0.1...v13.0.2) (2022-02-06)


### Bug Fixes

* **ie:** running IE on A5 and old nodejs ([087d58d](https://github.com/help-me-mom/ng-mocks/commit/087d58d873536921bc3b1745e38ac5213457eef3))

## [13.0.1](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0...v13.0.1) (2022-02-06)


### Bug Fixes

* **e2e:** support for A14 ([c0bdcbf](https://github.com/help-me-mom/ng-mocks/commit/c0bdcbfe1416ed18be46b2c2cd1feec274bfa0c5))
* looking in vcr.createComponent on root node [#1596](https://github.com/help-me-mom/ng-mocks/issues/1596) ([5aa0d9a](https://github.com/help-me-mom/ng-mocks/commit/5aa0d9abf76bca49b45c3cd57db49964b5c532a4))

# [13.0.0](https://github.com/help-me-mom/ng-mocks/compare/v12.5.1...v13.0.0) (2022-01-23)


### Bug Fixes

* **a13:** creating known props and methods ([5386f77](https://github.com/help-me-mom/ng-mocks/commit/5386f77c51905d12868f55a873fb03ee80fa6d47))
* **a13:** parsing a9 declarations ([b12e00a](https://github.com/help-me-mom/ng-mocks/commit/b12e00af1b4b39bd74e6d8458909f6d4290b8e6f))
* **core:** correct resets on errors ([e3b1809](https://github.com/help-me-mom/ng-mocks/commit/e3b18090c543c397cb95d99db4e553fabacb12f7))
* **core:** ignoring host bindings in mocks [#1427](https://github.com/help-me-mom/ng-mocks/issues/1427) ([411842c](https://github.com/help-me-mom/ng-mocks/commit/411842c6350dfec6df5e25debca2ac36a0ed1d56))
* **core:** parsing only own declarations [#1587](https://github.com/help-me-mom/ng-mocks/issues/1587) ([978bdbc](https://github.com/help-me-mom/ng-mocks/commit/978bdbcb064c767acd6710099349f05ed09207a9))


### Features

* **a13:** recursive declarations ([396573f](https://github.com/help-me-mom/ng-mocks/commit/396573fa7c46d005959994457398bf7490c320af))
* **a13:** support ([88c9752](https://github.com/help-me-mom/ng-mocks/commit/88c9752a6c2ef23264910794eaebb3a5408f8e65))


### BREAKING CHANGES

* **a13:** Angular 13 only support

# [13.0.0-alpha.6](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0-alpha.5...v13.0.0-alpha.6) (2022-01-18)


### Bug Fixes

* **core:** ignoring host bindings in mocks [#1427](https://github.com/help-me-mom/ng-mocks/issues/1427) ([411842c](https://github.com/help-me-mom/ng-mocks/commit/411842c6350dfec6df5e25debca2ac36a0ed1d56))

# [13.0.0-alpha.5](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0-alpha.4...v13.0.0-alpha.5) (2022-01-17)


### Bug Fixes

* **core:** parsing only own declarations [#1587](https://github.com/help-me-mom/ng-mocks/issues/1587) ([978bdbc](https://github.com/help-me-mom/ng-mocks/commit/978bdbcb064c767acd6710099349f05ed09207a9))

# [13.0.0-alpha.4](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0-alpha.3...v13.0.0-alpha.4) (2022-01-16)


### Bug Fixes

* **core:** correct resets on errors ([e3b1809](https://github.com/help-me-mom/ng-mocks/commit/e3b18090c543c397cb95d99db4e553fabacb12f7))

# [13.0.0-alpha.3](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0-alpha.2...v13.0.0-alpha.3) (2022-01-15)


### Bug Fixes

* **a13:** creating known props and methods ([5386f77](https://github.com/help-me-mom/ng-mocks/commit/5386f77c51905d12868f55a873fb03ee80fa6d47))
* **a13:** parsing a9 declarations ([b12e00a](https://github.com/help-me-mom/ng-mocks/commit/b12e00af1b4b39bd74e6d8458909f6d4290b8e6f))

# [13.0.0-alpha.2](https://github.com/help-me-mom/ng-mocks/compare/v13.0.0-alpha.1...v13.0.0-alpha.2) (2022-01-09)


### Features

* **a13:** recursive declarations ([396573f](https://github.com/help-me-mom/ng-mocks/commit/396573fa7c46d005959994457398bf7490c320af))

# [13.0.0-alpha.1](https://github.com/help-me-mom/ng-mocks/compare/v12.5.1...v13.0.0-alpha.1) (2022-01-08)


### Features

* **a13:** support ([88c9752](https://github.com/help-me-mom/ng-mocks/commit/88c9752a6c2ef23264910794eaebb3a5408f8e65))


### BREAKING CHANGES

* **a13:** Angular 13 only support

## [12.5.1](https://github.com/help-me-mom/ng-mocks/compare/v12.5.0...v12.5.1) (2021-12-20)

# [12.5.0](https://github.com/help-me-mom/ng-mocks/compare/v12.4.0...v12.5.0) (2021-09-13)


### Bug Fixes

* **MockInstance:** proper reset on empty config [#1046](https://github.com/help-me-mom/ng-mocks/issues/1046) ([7d1642d](https://github.com/help-me-mom/ng-mocks/commit/7d1642d37628f4624d0090158c6c0bf0b4c6ed06))


### Features

* **core:** Angular 13 support [#918](https://github.com/help-me-mom/ng-mocks/issues/918) ([3452363](https://github.com/help-me-mom/ng-mocks/commit/3452363b66c1068dfe50a2255d42d812167f0da7))

# [12.4.0](https://github.com/help-me-mom/ng-mocks/compare/v12.3.1...v12.4.0) (2021-07-25)


### Features

* **core:** internal stack integration with mocha runner [#838](https://github.com/help-me-mom/ng-mocks/issues/838) ([14a97d0](https://github.com/help-me-mom/ng-mocks/commit/14a97d07022d3766f4e8648130b3f6aefdc017eb))
* **MockInstance:** console.warn on forgotten resets [#857](https://github.com/help-me-mom/ng-mocks/issues/857) ([3e35252](https://github.com/help-me-mom/ng-mocks/commit/3e352520fce57b1ee11a45d87d5c79614a8e9929))
* **MockInstance:** manual control of mock scopes [#857](https://github.com/help-me-mom/ng-mocks/issues/857) ([fc8a2ed](https://github.com/help-me-mom/ng-mocks/commit/fc8a2eda8f03126e2651e1a31425fb47860b821d))

## [12.3.1](https://github.com/help-me-mom/ng-mocks/compare/v12.3.0...v12.3.1) (2021-07-04)


### Bug Fixes

* **core:** right storage of internal stacks ([ba0b64b](https://github.com/help-me-mom/ng-mocks/commit/ba0b64b04f7d0c742209c4298dd6ab60517a43ef))

# [12.3.0](https://github.com/help-me-mom/ng-mocks/compare/v12.2.0...v12.3.0) (2021-07-03)


### Bug Fixes

* **core:** using commonjs only because of optional packages [#761](https://github.com/help-me-mom/ng-mocks/issues/761) ([adbad49](https://github.com/help-me-mom/ng-mocks/commit/adbad49de90cecda9133a6cdf33a4bc75446f956))
* **jest:** better detection and error reporting of jest.mock [#760](https://github.com/help-me-mom/ng-mocks/issues/760) ([0903a12](https://github.com/help-me-mom/ng-mocks/commit/0903a12eef11a302756c936ed606ee830331e419))
* **MockBuilder:** params support tokens and modules with providers [#762](https://github.com/help-me-mom/ng-mocks/issues/762) ([d58693e](https://github.com/help-me-mom/ng-mocks/commit/d58693eb679698fddb659af84d42aa1066683ad9))


### Features

* **ngMocks:** allows to suppress console logs [#578](https://github.com/help-me-mom/ng-mocks/issues/578) ([ee1c6bb](https://github.com/help-me-mom/ng-mocks/commit/ee1c6bbf9eaff52f80d378260c529d3374a5ee59))

# [12.2.0](https://github.com/help-me-mom/ng-mocks/compare/v12.1.2...v12.2.0) (2021-06-30)


### Bug Fixes

* **core:** allowing spies on ComponentFactoryResolver.resolveComponentFactory [#736](https://github.com/help-me-mom/ng-mocks/issues/736) ([fda714e](https://github.com/help-me-mom/ng-mocks/commit/fda714edf85db1c0378dc9ec8136524f798add3c))
* **core:** mock of mock will return itself ([4358b99](https://github.com/help-me-mom/ng-mocks/commit/4358b99340c83b9c22f80ce19d86b35ff444e69a))


### Features

* **core:** mock for root and platform definitions [#735](https://github.com/help-me-mom/ng-mocks/issues/735) ([04128b6](https://github.com/help-me-mom/ng-mocks/commit/04128b686fdb160c01634bd3284a8d17534ab50e))
* **core:** throw on console can accept custom method names ([fecc878](https://github.com/help-me-mom/ng-mocks/commit/fecc878813ffa31ccf1c465b45e9c0d68298ff8c))

## [12.1.2](https://github.com/help-me-mom/ng-mocks/compare/v12.1.1...v12.1.2) (2021-06-20)


### Performance Improvements

* **mock-render:** caching generated component [#731](https://github.com/help-me-mom/ng-mocks/issues/731) ([66e23c5](https://github.com/help-me-mom/ng-mocks/commit/66e23c50930028f6b204e87fc58905d861bbb0d5))

## [12.1.1](https://github.com/help-me-mom/ng-mocks/compare/v12.1.0...v12.1.1) (2021-06-19)


### Bug Fixes

* **core:** building cjs and mjs [#702](https://github.com/help-me-mom/ng-mocks/issues/702) ([f11c086](https://github.com/help-me-mom/ng-mocks/commit/f11c0861b80fec66ad6462c3bbb62a24105854f6))
* **core:** supports mocks for viewProviders [#726](https://github.com/help-me-mom/ng-mocks/issues/726) ([68f9946](https://github.com/help-me-mom/ng-mocks/commit/68f9946c0cd50745407b5eb79db539fe71337727))
* **faster:** support for pure TestBed [#721](https://github.com/help-me-mom/ng-mocks/issues/721) ([d4e0c8a](https://github.com/help-me-mom/ng-mocks/commit/d4e0c8ae39fc165795a8e4ff058cd26fe5c38f2d))
* **mock-builder:** provides globally exported providers from directives and components [#623](https://github.com/help-me-mom/ng-mocks/issues/623) ([58ee0d8](https://github.com/help-me-mom/ng-mocks/commit/58ee0d84304ec9a63eefe598c3cf7429a4f86107))

# [12.1.0](https://github.com/help-me-mom/ng-mocks/compare/v12.0.2...v12.1.0) (2021-06-05)


### Bug Fixes

* **core:** excluding StoreDevtoolsModule by default [#589](https://github.com/help-me-mom/ng-mocks/issues/589) ([c376e93](https://github.com/help-me-mom/ng-mocks/commit/c376e9343b52cef740700a7c1d4383d03e0b24c1))
* **core:** supporting jest-circus as a test runner [#610](https://github.com/help-me-mom/ng-mocks/issues/610) ([aaa0380](https://github.com/help-me-mom/ng-mocks/commit/aaa0380df91e985fe2b28b8eeac29c11f9833ba7))
* **jest:** a fix in advance to listen to jest hooks [#610](https://github.com/help-me-mom/ng-mocks/issues/610) ([1290c8a](https://github.com/help-me-mom/ng-mocks/commit/1290c8a48087e6aa9c9df1280616a6f3ede03c1b))
* **mock-builder:** keeps and mocks modules with providers properly [#625](https://github.com/help-me-mom/ng-mocks/issues/625) ([4d4ff49](https://github.com/help-me-mom/ng-mocks/commit/4d4ff49f6e2b412ad324735ca7952082849f4da2))
* **mock-render:** factory can be used in describes [#629](https://github.com/help-me-mom/ng-mocks/issues/629) ([f440760](https://github.com/help-me-mom/ng-mocks/commit/f4407609ccd68ee46153bf3461c21a7fd50e264e))
* **mock-render:** skipping proxy for bindings from factory [#621](https://github.com/help-me-mom/ng-mocks/issues/621) ([f4dae60](https://github.com/help-me-mom/ng-mocks/commit/f4dae609c625eda02c35056882995cff539f1e19))


### Features

* **core:** replacing animations with noop by default [#641](https://github.com/help-me-mom/ng-mocks/issues/641) ([ca65de3](https://github.com/help-me-mom/ng-mocks/commit/ca65de3a2747fd1ac69c2dcef47a4896c7aa13a2))


### Reverts

* Revert "chore(deps): update dependency jest to v27" ([1f4bd9a](https://github.com/help-me-mom/ng-mocks/commit/1f4bd9ab53441c0057653d99c4e679a2c77382c5))

## [12.0.2](https://github.com/help-me-mom/ng-mocks/compare/v12.0.1...v12.0.2) (2021-05-25)


### Bug Fixes

* **mock-render:** default to onTestBedFlushNeed = warn [#593](https://github.com/help-me-mom/ng-mocks/issues/593) ([a9e535c](https://github.com/help-me-mom/ng-mocks/commit/a9e535c75a8abd1ed8f6826f7581e03b9a84d759))
* **mock-render:** dynamic params and cdr for factory [#586](https://github.com/help-me-mom/ng-mocks/issues/586) ([73f54c5](https://github.com/help-me-mom/ng-mocks/commit/73f54c52731b60c988a28fa6f7fa6e951388fd9e))

## [12.0.1](https://github.com/help-me-mom/ng-mocks/compare/v12.0.0...v12.0.1) (2021-05-21)


### Bug Fixes

* **core:** a config parameter to suppress MockRender errors [#572](https://github.com/help-me-mom/ng-mocks/issues/572) ([bcfe23a](https://github.com/help-me-mom/ng-mocks/commit/bcfe23ab53a87a92529ddb30bb07618cbaab590c))
* **core:** broken query selectors are properly normalized [#567](https://github.com/help-me-mom/ng-mocks/issues/567) ([9c1ea70](https://github.com/help-me-mom/ng-mocks/commit/9c1ea70564f11323337646a6d74ebbddc8965a31))
* **default-mock:** supports an array with declarations [#568](https://github.com/help-me-mom/ng-mocks/issues/568) ([5d3b43e](https://github.com/help-me-mom/ng-mocks/commit/5d3b43e91db0a8e8a40dedc024a40cbd76225575))
* **default-mock:** supports generic type in array signature [#583](https://github.com/help-me-mom/ng-mocks/issues/583) ([c925818](https://github.com/help-me-mom/ng-mocks/commit/c925818e13086e402f79fa49c39e012567d7b52a))
* **faster:** supports directives and components without selectors [#576](https://github.com/help-me-mom/ng-mocks/issues/576) ([599c7d5](https://github.com/help-me-mom/ng-mocks/commit/599c7d518cbf280da85a73aa2a1c23ce85d74523))
* **mock-render:** allowing to disable flush TestBed warning ([6131ecb](https://github.com/help-me-mom/ng-mocks/commit/6131ecbf3f45205ec059184819a9ce68c81e1502))
* **mock-render:** providing a MockRenderFactory in order to reuse the same middleware component ([79fa336](https://github.com/help-me-mom/ng-mocks/commit/79fa3368798eaf9e49c92201a9b6a693e5f63e8b))


### Performance Improvements

* **core:** switching internal stack to an array instead of a set ([24c4bfd](https://github.com/help-me-mom/ng-mocks/commit/24c4bfd7b514b2ed38497039853a5958c721cff8))

# [12.0.0](https://github.com/help-me-mom/ng-mocks/compare/v11.11.2...v12.0.0) (2021-05-13)


### Features

* official support of Angular 12 ([d63c34f](https://github.com/help-me-mom/ng-mocks/commit/d63c34ffc720573e7c92f81cda557f05e471abb7))


### BREAKING CHANGES

* auto spy should be installed via ngMocks.autoSpy

## [11.11.2](https://github.com/help-me-mom/ng-mocks/compare/v11.11.1...v11.11.2) (2021-05-13)


### Bug Fixes

* **core:** properly handling Sanitizer and DomSanitizer [#538](https://github.com/help-me-mom/ng-mocks/issues/538) ([fb51bb4](https://github.com/help-me-mom/ng-mocks/commit/fb51bb478593c22ed436c896980244d45fd796ed))
* **mock-render:** detectChanges flag has to be provided to supress render ([8195eeb](https://github.com/help-me-mom/ng-mocks/commit/8195eeb7e4dbeeac71061a9ac94b1436f7cfdb0c))

## [11.11.1](https://github.com/help-me-mom/ng-mocks/compare/v11.11.0...v11.11.1) (2021-05-09)


### Bug Fixes

* **mock-render:** binds all inputs on no params [#522](https://github.com/help-me-mom/ng-mocks/issues/522) ([dd5abba](https://github.com/help-me-mom/ng-mocks/commit/dd5abba942f8e51f61542dec10b67aaa94a24513))

# [11.11.0](https://github.com/help-me-mom/ng-mocks/compare/v11.10.1...v11.11.0) (2021-05-09)


### Bug Fixes

* **mock-builder:** overrides mock modules for platform [#435](https://github.com/help-me-mom/ng-mocks/issues/435) ([bf469bc](https://github.com/help-me-mom/ng-mocks/commit/bf469bc3085d2b4ab4d65dec3b076e306d7ee5d3))
* **mock-builder:** respecting forward-ref and modules with providers [#312](https://github.com/help-me-mom/ng-mocks/issues/312) ([4a099b8](https://github.com/help-me-mom/ng-mocks/commit/4a099b80c46397810a17e876e3a13fb2d6484648))
* overrides as functions are properly cloned [#455](https://github.com/help-me-mom/ng-mocks/issues/455) ([9310d34](https://github.com/help-me-mom/ng-mocks/commit/9310d34e9106ac6866092bd3a6d5c33748eb3b4c))
* skipping wrong query selectors [#445](https://github.com/help-me-mom/ng-mocks/issues/445) ([6750939](https://github.com/help-me-mom/ng-mocks/commit/6750939376f5f1fcaa11f03f822cbe4aefbbf59b))
* supporting new structure of lView ([8d3cadf](https://github.com/help-me-mom/ng-mocks/commit/8d3cadfafe1a21d129c57cd562236f92a514d59b))
* **#333:** register mock components with entryComponents ([3a53431](https://github.com/help-me-mom/ng-mocks/commit/3a53431a22b731f53d245bf8ef7021c97db1df65)), closes [#333](https://github.com/help-me-mom/ng-mocks/issues/333)


### Features

* **faster:** supports MockRender in beforeAll [#488](https://github.com/help-me-mom/ng-mocks/issues/488) ([df4418c](https://github.com/help-me-mom/ng-mocks/commit/df4418c60382e9ce89defbdd0ffdc1a3728d39a7))
* **mock-builder:** accepts arrays in params [#386](https://github.com/help-me-mom/ng-mocks/issues/386) ([c8d8e40](https://github.com/help-me-mom/ng-mocks/commit/c8d8e40be503cce5d580ca4d64717d4ebf9c5114))
* **mock-render:** generates tpl only for provided inputs and outputs [#434](https://github.com/help-me-mom/ng-mocks/issues/434) ([23d45a2](https://github.com/help-me-mom/ng-mocks/commit/23d45a2f4c9f191ff6edcec8d985dba20c9a4ceb))
* **mock-render:** throws on wrong usage [#488](https://github.com/help-me-mom/ng-mocks/issues/488) ([b4a62bc](https://github.com/help-me-mom/ng-mocks/commit/b4a62bc5f594606db07de04f63c2bef44f57b2e2))
* almost all ngMocks helpers support css selectors [#317](https://github.com/help-me-mom/ng-mocks/issues/317) ([b348842](https://github.com/help-me-mom/ng-mocks/commit/b348842033bddb1ab82e57a62c0fc1a4e7940feb))

## [11.10.1](https://github.com/help-me-mom/ng-mocks/compare/v11.10.0...v11.10.1) (2021-04-12)


### Bug Fixes

* **#354:** better error instead of is not in JIT mode ([45f05fb](https://github.com/help-me-mom/ng-mocks/commit/45f05fb94e86487ea0c5c40fe024b16b2ca7803a)), closes [#354](https://github.com/help-me-mom/ng-mocks/issues/354)
* **#377:** respect of providedIn in Injectable ([91aba4b](https://github.com/help-me-mom/ng-mocks/commit/91aba4bd33ce67d37c727bc2e8b29d90e3cb42e1)), closes [#377](https://github.com/help-me-mom/ng-mocks/issues/377)

# [11.10.0](https://github.com/help-me-mom/ng-mocks/compare/v11.9.1...v11.10.0) (2021-04-04)


### Bug Fixes

* **#316:** better support for typeIn and ngModel ([7d03c2d](https://github.com/help-me-mom/ng-mocks/commit/7d03c2dbe770bab188370fb96d0b4b6b5e18cbe5)), closes [#316](https://github.com/help-me-mom/ng-mocks/issues/316)
* **#320:** full implementation of ngMocks.touch and ngMocks.change ([fd81409](https://github.com/help-me-mom/ng-mocks/commit/fd81409591d67c931f5686fd23210829179b8e75)), closes [#320](https://github.com/help-me-mom/ng-mocks/issues/320)
* **#324:** smarter touches and changes ([fa418d0](https://github.com/help-me-mom/ng-mocks/commit/fa418d0440876a9eab55564e75e3807b9a60687c)), closes [#324](https://github.com/help-me-mom/ng-mocks/issues/324)


### Features

* **#314:** ngMocks.formatText ([fa3cea7](https://github.com/help-me-mom/ng-mocks/commit/fa3cea73f5709fbc03ae2a8999281876289ccd43)), closes [#314](https://github.com/help-me-mom/ng-mocks/issues/314)
* **#315:** ngMocks.trigger and ngMocks.click ([2ae6e5a](https://github.com/help-me-mom/ng-mocks/commit/2ae6e5ab0de6f1e3505cf26ac5752a63a458e059)), closes [#315](https://github.com/help-me-mom/ng-mocks/issues/315)

## [11.9.1](https://github.com/help-me-mom/ng-mocks/compare/v11.9.0...v11.9.1) (2021-03-14)


### Bug Fixes

* supporting schematics for updates ([8e30404](https://github.com/help-me-mom/ng-mocks/commit/8e3040487ef9bf1889a1117718fb0b593f2c38fc))

# [11.9.0](https://github.com/help-me-mom/ng-mocks/compare/v11.8.0...v11.9.0) (2021-02-27)


### Bug Fixes

* **#305:** better injection of NgControl ([f85f497](https://github.com/help-me-mom/ng-mocks/commit/f85f497f0dab32363e67980a9f1dc37b0b321208)), closes [#305](https://github.com/help-me-mom/ng-mocks/issues/305)


### Features

* simpler tools for form controls [ngMocks.change](https://ng-mocks.sudo.eu/api/ngMocks/change) and [ngMocks.touch](https://ng-mocks.sudo.eu/api/ngMocks/touch) ([753b975](https://github.com/help-me-mom/ng-mocks/commit/753b97547b8f4ee4f7b0c2709ad3ce4d6e0961fe))

# [11.8.0](https://github.com/help-me-mom/ng-mocks/compare/v11.7.0...v11.8.0) (2021-02-25)


### Features

* find ng-container via [ngMocks.reveal](https://ng-mocks.sudo.eu/api/ngMocks/reveal) and [revealAll](https://ng-mocks.sudo.eu/api/ngMocks/revealAll) ([71390b2](https://github.com/help-me-mom/ng-mocks/commit/71390b2ceff4b812a75ffff24838f4866a4d736c)), closes [#289](https://github.com/help-me-mom/ng-mocks/issues/289)
* [ngMocks.render](https://ng-mocks.sudo.eu/api/ngMocks/render) and [.hide](https://ng-mocks.sudo.eu/api/ngMocks/hide) support debugNodes ([55a1b4c](https://github.com/help-me-mom/ng-mocks/commit/55a1b4c5e225dee691a2f80ea320c7c9336b918b))
* respect of virtual dom with [ngMocks.crawl](https://ng-mocks.sudo.eu/api/ngMocks/crawl) ([030b29f](https://github.com/help-me-mom/ng-mocks/commit/030b29f26ccd68f8c2f8fb93c8466df4675eacb4)), closes [#289](https://github.com/help-me-mom/ng-mocks/issues/289)

# [11.7.0](https://github.com/help-me-mom/ng-mocks/compare/v11.6.0...v11.7.0) (2021-02-19)


### Bug Fixes

* cannot set property 'form' of undefined ([a7b60e9](https://github.com/help-me-mom/ng-mocks/commit/a7b60e9f35b51820c0ce51061f31a33a0c2c53f2)), closes [#302](https://github.com/help-me-mom/ng-mocks/issues/302)
* correct replacement of useExisting providers ([6908e5f](https://github.com/help-me-mom/ng-mocks/commit/6908e5f7577b382ae5dfe8f3857b3f4f3e0b1959))


### Features

* improved TemplateRef [render](https://ng-mocks.sudo.eu/api/ngMocks/render) ([151ff34](https://github.com/help-me-mom/ng-mocks/commit/151ff34ee4ab7438e2a08982f643e4aca9bd22c0)), closes [#291](https://github.com/help-me-mom/ng-mocks/issues/291)

# [11.6.0](https://github.com/help-me-mom/ng-mocks/compare/v11.5.0...v11.6.0) (2021-02-14)


### Bug Fixes

* all find functions can handle undefined debug element ([397ecf8](https://github.com/help-me-mom/ng-mocks/commit/397ecf8b731cdb8aee7effd16f6d0dca536bc0f3))
* better types ([bd7f72b](https://github.com/help-me-mom/ng-mocks/commit/bd7f72b4841c1e603ddb592de53f7bd44541c208))
* correct stop of search in ivy tree ([952986e](https://github.com/help-me-mom/ng-mocks/commit/952986e89a76bb0a1effd7fe2ee030782694cce3)), closes [#298](https://github.com/help-me-mom/ng-mocks/issues/298)
* issue of useExisting and mat components ([0714da8](https://github.com/help-me-mom/ng-mocks/commit/0714da82100f38f4f34d74e77245855a09478cfa))


### Features

* find TemplateRef / ng-template ([093eea7](https://github.com/help-me-mom/ng-mocks/commit/093eea7b7a8a818f060192eb354623e3abd88b74)), closes [#290](https://github.com/help-me-mom/ng-mocks/issues/290)
* support of A12 ([4627fe2](https://github.com/help-me-mom/ng-mocks/commit/4627fe23ca496db610d8911ff6b1c1e97c6f70e8)), closes [#293](https://github.com/help-me-mom/ng-mocks/issues/293)
* **#288:** correct render for ContentChild properties ([5fec515](https://github.com/help-me-mom/ng-mocks/commit/5fec51598613422f531b60f12058563209abb929)), closes [#288](https://github.com/help-me-mom/ng-mocks/issues/288)

# [11.5.0](https://github.com/help-me-mom/ng-mocks/compare/v11.4.0...v11.5.0) (2021-01-22)


### Bug Fixes

* fixing doc urls ([5fc0ae3](https://github.com/help-me-mom/ng-mocks/commit/5fc0ae33714c761929a4e1e239a65f413ea07a5d))


### Features

* **mock-instance:** simpler interface ([0306643](https://github.com/help-me-mom/ng-mocks/commit/0306643c8bf44b4876aedf88b9375cda8490566f))

# [11.4.0](https://github.com/help-me-mom/ng-mocks/compare/v11.3.1...v11.4.0) (2021-01-17)


### Bug Fixes

* descriptor.configurable = true ([68a8751](https://github.com/help-me-mom/ng-mocks/commit/68a87510e561445c74530391afe7577ed1249d18))
* **guts:** respect ngMocks.default ([59bb586](https://github.com/help-me-mom/ng-mocks/commit/59bb58692ec3fb4119ce16f661e978aac64b3020))
* **mock-instance:** a separate config scope ([a0c930c](https://github.com/help-me-mom/ng-mocks/commit/a0c930c2825b672e820e2ffbcf1c89e49e625e26))
* **mock-module:** excludes modules with providers correctly ([b5cb39c](https://github.com/help-me-mom/ng-mocks/commit/b5cb39cd2964d4f1d3400414ed6b9a924f588986)), closes [#271](https://github.com/help-me-mom/ng-mocks/issues/271)
* **mock-render:** static selector for declarations w/o selector ([8f39d1f](https://github.com/help-me-mom/ng-mocks/commit/8f39d1feeaa849df7af3a9bc339fbd974b832c83))
* @angular/forms is optional ([bfaf495](https://github.com/help-me-mom/ng-mocks/commit/bfaf495ed68c728bdd47c54031227b1d7b6514ce))
* avoiding cache in providers' declaration ([da98414](https://github.com/help-me-mom/ng-mocks/commit/da98414fb5f908701d661c0032f7c3352a7ff5be))
* grouping similarities ([e1bc77b](https://github.com/help-me-mom/ng-mocks/commit/e1bc77baccfec41bf56227e232ba587bb802fff6))


### Features

* **ng-mocks:** ngMocks.stubMember returns passed value ([27f5404](https://github.com/help-me-mom/ng-mocks/commit/27f540469799b27c5c5d0d3e42a2f86173144a1b))
* **ng-mocks:** renaming ngMocks.default to ngMocks.global ([d9f46d3](https://github.com/help-me-mom/ng-mocks/commit/d9f46d328979235220b6a25e2101bdb8658d78de))
* **ng-mocks:** ngMocks.stubMember ([efcd175](https://github.com/help-me-mom/ng-mocks/commit/efcd175ee6b08f8ef5c549d0792141025c13fdcf))
* **ng-mocks:** ngMocks.throwOnConsole ([7b0f2f8](https://github.com/help-me-mom/ng-mocks/commit/7b0f2f81c147133f691ad520ae9707baf97785f2))
* **ng-mocks:** ngMocks.globalExclude ([bdd2821](https://github.com/help-me-mom/ng-mocks/commit/bdd2821b3881c8edfe69ce1f1c67dbf8a18b0f6e))
* **ng-mocks:** ngMocks.globalKeep ([e89b876](https://github.com/help-me-mom/ng-mocks/commit/e89b87636d13fbeb93ecfb4b2bbd4fccf7240f2e))
* **ng-mocks:** ngMocks.globalReplace ([330868f](https://github.com/help-me-mom/ng-mocks/commit/330868fe71a25faf62d07c18af49e8448b2a2d19))
* **ng-mocks:** ngMocks.globalWipe ([cb71bdb](https://github.com/help-me-mom/ng-mocks/commit/cb71bdb6557243ebe580747acf387a54dbc803d1))

## [11.3.1](https://github.com/help-me-mom/ng-mocks/compare/v11.3.0...v11.3.1) (2021-01-02)


### Bug Fixes

* declarations w/o selectors are reachable with ngMocks helpers ([ac26d81](https://github.com/help-me-mom/ng-mocks/commit/ac26d81b83feda6538b172f1927c2f9299c3ad46)), closes [#266](https://github.com/help-me-mom/ng-mocks/issues/266)

# [11.3.0](https://github.com/help-me-mom/ng-mocks/compare/v11.2.8...v11.3.0) (2021-01-01)


### Bug Fixes

* better umd support ([b9b068c](https://github.com/help-me-mom/ng-mocks/commit/b9b068c20cc3cf56b6cddea8efa28ea7f3a38316))


### Features

* **mock-render:** renders everything ([f33a132](https://github.com/help-me-mom/ng-mocks/commit/f33a1320a8cc98dd42dacb6c6cdcd5a190218580)), closes [#266](https://github.com/help-me-mom/ng-mocks/issues/266)

## [11.2.8](https://github.com/help-me-mom/ng-mocks/compare/v11.2.7...v11.2.8) (2020-12-27)


### Bug Fixes

* removal dependency on decorators ([92064d4](https://github.com/help-me-mom/ng-mocks/commit/92064d480011600cbbcee70245bda12449b4e4e5))
* removal dependency on reflect-metadata ([57cedfb](https://github.com/help-me-mom/ng-mocks/commit/57cedfb08805095481b377cf84b9fd7329acd9e4))

## [11.2.7](https://github.com/help-me-mom/ng-mocks/compare/v11.2.6...v11.2.7) (2020-12-25)


### Bug Fixes

* **mock-instance:** graceful reset after specs ([2e395df](https://github.com/help-me-mom/ng-mocks/commit/2e395dfa48192d367fd13a691925160e97bcd33c))
* **mock-instance:** supports tokens ([92abb82](https://github.com/help-me-mom/ng-mocks/commit/92abb82b3fa8e35c248dd3098fd47ab4543a3354))

## [11.2.6](https://github.com/help-me-mom/ng-mocks/compare/v11.2.5...v11.2.6) (2020-12-21)


### Bug Fixes

* **auto-spy:** in legacy parts too ([114ae22](https://github.com/help-me-mom/ng-mocks/commit/114ae227e97b4ba420feb749e270383e44f8ed2f))

## [11.2.5](https://github.com/help-me-mom/ng-mocks/compare/v11.2.4...v11.2.5) (2020-12-20)


### Bug Fixes

* **auto-spy:** as a function call instead of import ([3b7d8f7](https://github.com/help-me-mom/ng-mocks/commit/3b7d8f7f9d47c0e8804ab69dce1740a63cff55e5))

## [11.2.4](https://github.com/help-me-mom/ng-mocks/compare/v11.2.3...v11.2.4) (2020-12-13)


### Bug Fixes

* now MockRender's proxy component respects outside params changes ([9297cd1](https://github.com/help-me-mom/ng-mocks/commit/9297cd13a47d258e8180e25ac1352982801a0282))

## [11.2.3](https://github.com/help-me-mom/ng-mocks/compare/v11.2.2...v11.2.3) (2020-12-10)


### Bug Fixes

* **#246:** auto spy covers control value accessor too ([5c5b003](https://github.com/help-me-mom/ng-mocks/commit/5c5b003312b08664909f41b478806f02ca5051ee)), closes [#246](https://github.com/help-me-mom/ng-mocks/issues/246)
* **#248:** handling null and undefined in declarations ([13b9e4e](https://github.com/help-me-mom/ng-mocks/commit/13b9e4e36f500ca4de511cb125321a3d918ae5e8)), closes [#248](https://github.com/help-me-mom/ng-mocks/issues/248)
* correct overriding order for pipes ([750153d](https://github.com/help-me-mom/ng-mocks/commit/750153da57d3ad727439356daf3b86e27c7e8937))

## [11.2.2](https://github.com/help-me-mom/ng-mocks/compare/v11.2.0...v11.2.2) (2020-12-05)


### Bug Fixes

* auto-spy covers pipes with default transform ([980b4d7](https://github.com/help-me-mom/ng-mocks/commit/980b4d753f9fc8b52c790629ab82c8e9f9b1a924))

# [11.2.0](https://github.com/help-me-mom/ng-mocks/compare/v11.1.4...v11.2.0) (2020-12-04)


### Bug Fixes

* ngMocks.guts reuses mock pipes ([13dd2c9](https://github.com/help-me-mom/ng-mocks/commit/13dd2c9a13d7d4452271714a765ab0f366bb1adc)), closes [#241](https://github.com/help-me-mom/ng-mocks/issues/241)


### Features

* global configuration for default mocks ([29715f8](https://github.com/help-me-mom/ng-mocks/commit/29715f8726add098481a67d51aa6a4d12c714e03)), closes [#226](https://github.com/help-me-mom/ng-mocks/issues/226)
* impure pipes support + `.get`, `.findInstance` can find them in fixtures ([efa6337](https://github.com/help-me-mom/ng-mocks/commit/efa63379ae157c72cdb41579bc109751b3a99b65)), closes [#240](https://github.com/help-me-mom/ng-mocks/issues/240)
* now `.mock` extends by default, use `precise` flag to get old behavior ([bf576fd](https://github.com/help-me-mom/ng-mocks/commit/bf576fd6294a2359ce52c3ba6a13607447e07f99))

## [11.1.4](https://github.com/help-me-mom/ng-mocks/compare/v11.1.3...v11.1.4) (2020-11-29)


### Bug Fixes

* a contemporary example ([d0e5efc](https://github.com/help-me-mom/ng-mocks/commit/d0e5efc435f40445718d6ce64604996073b37783))

## [11.1.3](https://github.com/help-me-mom/ng-mocks/compare/v11.1.2...v11.1.3) (2020-11-26)


### Bug Fixes

* clear return statements in the docs ([44b12e4](https://github.com/help-me-mom/ng-mocks/commit/44b12e4f4db8017f5c03fd325e8a61b5fb1a2ea3))

## [11.1.2](https://github.com/help-me-mom/ng-mocks/compare/v11.1.1...v11.1.2) (2020-11-25)


### Bug Fixes

* issue with mock multi token providers ([774f171](https://github.com/help-me-mom/ng-mocks/commit/774f171a907789829c4b4c7387b88e4824c29472))


### Performance Improvements

* cc cognitive complexity ([8ac1fac](https://github.com/help-me-mom/ng-mocks/commit/8ac1fac6eff12b72611674a355e20f10304f3dac))
* cc cognitive complexity ([7f677f4](https://github.com/help-me-mom/ng-mocks/commit/7f677f4b1641bc2a4cf052f2080356de61ec6da8))
* cc cognitive complexity ([3d0e118](https://github.com/help-me-mom/ng-mocks/commit/3d0e118ebc7d839c5c96590d9145b19b10c0574a))
* cc cognitive complexity ([11859ad](https://github.com/help-me-mom/ng-mocks/commit/11859adcb43f51be73c3b685bf641a14ff07be76))
* cc cognitive complexity ([74783a9](https://github.com/help-me-mom/ng-mocks/commit/74783a9f26b977feae2184e9e2ef98282e996c0e))
* cc complex logical expression ([b7c1b76](https://github.com/help-me-mom/ng-mocks/commit/b7c1b76dec7d5cbdf21ed4bc00f662ac5780e526))
* cc duplicates ([4e81ff9](https://github.com/help-me-mom/ng-mocks/commit/4e81ff97d74e0fd94bae00fd553f2210c49246b8))
* cc duplicates ([73f607a](https://github.com/help-me-mom/ng-mocks/commit/73f607a2aa4828fd51b71119624e1057adcccc5e))
* cc duplicates ([6bebb6b](https://github.com/help-me-mom/ng-mocks/commit/6bebb6b119c9569880c750810020aee9b9373163))
* cc duplicates ([f258991](https://github.com/help-me-mom/ng-mocks/commit/f25899140ebb7696bf9be3394a8ff84db99768c0))
* cc duplicates ([8553dcb](https://github.com/help-me-mom/ng-mocks/commit/8553dcb3e2ca464fb11837c6032fdb0154d84f36))

## [11.1.1](https://github.com/help-me-mom/ng-mocks/compare/v11.1.0...v11.1.1) (2020-11-21)


### Bug Fixes

* latest typescript ([e976ed9](https://github.com/help-me-mom/ng-mocks/commit/e976ed928ed52726365e7dbe48c842108490af30))

# [11.1.0](https://github.com/help-me-mom/ng-mocks/compare/v11.0.0...v11.1.0) (2020-11-20)


### Features

* overrides for MockService ([6492a3e](https://github.com/help-me-mom/ng-mocks/commit/6492a3ee9c984111465555e62a3327d2389e5b84))

# [11.0.0](https://github.com/help-me-mom/ng-mocks/compare/v10.5.4...v11.0.0) (2020-11-15)


### Bug Fixes

* removing deprecations ([2625352](https://github.com/help-me-mom/ng-mocks/commit/262535265cf09e151e7a578f1325fd7cd8067352))
* respecting internals vs externals ([d4abf41](https://github.com/help-me-mom/ng-mocks/commit/d4abf41d996763fdb90ec77992055ed5164d9081)), closes [#44](https://github.com/help-me-mom/ng-mocks/issues/44)


### Features

* angular 11 support ([eef7b94](https://github.com/help-me-mom/ng-mocks/commit/eef7b94381a5cd1da4468ea9364ead480a62aa10))


### BREAKING CHANGES

* respects internals vs externals, to access them use guts or MockBuilder
* removed NG_GUARDS, use NG_MOCKS_GUARDS
* removed NG_INTERCEPTORS, use NG_MOCKS_INTERCEPTORS
* removed custom meta in MockComponent
* removed MockHelper, use ngMocks
* A11

## [10.5.4](https://github.com/help-me-mom/ng-mocks/compare/v10.5.3...v10.5.4) (2020-11-14)


### Bug Fixes

* better handling of double decorations ([60bbebc](https://github.com/help-me-mom/ng-mocks/commit/60bbebc506325faa236b29249d686cbae17e5569))
* flex behavior for a mock pipe ([9769061](https://github.com/help-me-mom/ng-mocks/commit/97690614511753dc8cb5bcf6dcbc4d57ca9f3eb3))
* searching for things in default fixture ([17b5208](https://github.com/help-me-mom/ng-mocks/commit/17b5208afcc50ac2705f15bc6fd9c016eda627ce))

## [10.5.3](https://github.com/help-me-mom/ng-mocks/compare/v10.5.2...v10.5.3) (2020-11-07)


### Bug Fixes

* an example how to handle "TypeError: Cannot read property 'subscribe' of undefined" ([6501a87](https://github.com/help-me-mom/ng-mocks/commit/6501a87b7ea433c9250ae7805dd2a7f8d2a4d063)), closes [#226](https://github.com/help-me-mom/ng-mocks/issues/226)
* info how to solve "type is part of the declarations of 2 modules" ([f5ee1bc](https://github.com/help-me-mom/ng-mocks/commit/f5ee1bcfde02443ff4fadb0ca1f357f02cdeb610))
* mock-render proxy ([eaeabba](https://github.com/help-me-mom/ng-mocks/commit/eaeabba28897ea29b2f58109c193a27bf5278518))
* relaxed signature of MockInstance ([dccaa2d](https://github.com/help-me-mom/ng-mocks/commit/dccaa2d93f671474aedc76de381ff8546310a55f))

## [10.5.2](https://github.com/help-me-mom/ng-mocks/compare/v10.5.1...v10.5.2) (2020-11-04)


### Bug Fixes

* keeping root providers for kept modules ([dc078af](https://github.com/help-me-mom/ng-mocks/commit/dc078af4b85e9e57b17091c21b11d670960f95df)), closes [#222](https://github.com/help-me-mom/ng-mocks/issues/222)
* providing a root service as it is for kept declarations ([e5486e6](https://github.com/help-me-mom/ng-mocks/commit/e5486e6b29e39ee403aa3f514b7671f3fa442b58)), closes [#222](https://github.com/help-me-mom/ng-mocks/issues/222)
* respecting mock keep switch in nested modules ([2f185fb](https://github.com/help-me-mom/ng-mocks/commit/2f185fb9ca7be3d96abb14e37f700d76826a13de))
* support of ngOnChanges from OnChanges interface ([820dc94](https://github.com/help-me-mom/ng-mocks/commit/820dc946c0c4963c1ea715584471d25ff44e6c60))

## [10.5.1](https://github.com/help-me-mom/ng-mocks/compare/v10.5.0...v10.5.1) (2020-11-01)


### Bug Fixes

* mocking custom deps of providers ([87da53b](https://github.com/help-me-mom/ng-mocks/commit/87da53b646bdb0cdb30ddf4c87d3348e87b176ee))
* providing MockProvider and its docs ([ecfb15d](https://github.com/help-me-mom/ng-mocks/commit/ecfb15de2bd6f0fd308a10a4cd907775df994bdd))

# [10.5.0](https://github.com/help-me-mom/ng-mocks/compare/v10.4.0...v10.5.0) (2020-10-30)


### Bug Fixes

* mocking token more intelligently ([0f7cc0c](https://github.com/help-me-mom/ng-mocks/commit/0f7cc0c0a6513d208c5e63602c643ef1764ff7d4))
* supporting null as keepDeclaration of MockBuilder ([5f44445](https://github.com/help-me-mom/ng-mocks/commit/5f44445ebccf99fab62c21d6199af9c590408659))
* supporting pipes in providers ([6e252e8](https://github.com/help-me-mom/ng-mocks/commit/6e252e81c818c7cf88f8945304edc8d2f67cbd68)), closes [#218](https://github.com/help-me-mom/ng-mocks/issues/218)


### Features

* detecting global providers and mocking them ([a36a9df](https://github.com/help-me-mom/ng-mocks/commit/a36a9df46788ae9236f5e2f61aa39b86b58eceb2))
* exclude feature for ngMocks.guts ([1886fd1](https://github.com/help-me-mom/ng-mocks/commit/1886fd1894e3180bd43b7f868931c0e7fe83b852))
* token to exclude all guards ([7068784](https://github.com/help-me-mom/ng-mocks/commit/7068784541c6a0ec1ca90b38cb4169ec373dd5e7))
* token to exclude all interceptors ([660f4c4](https://github.com/help-me-mom/ng-mocks/commit/660f4c413eb90796eb79c126e7614677e87b5b4c))

# [10.4.0](https://github.com/help-me-mom/ng-mocks/compare/v10.3.0...v10.4.0) (2020-10-24)


### Features

* exportAll flag for modules ([5f8835c](https://github.com/help-me-mom/ng-mocks/commit/5f8835c365db3f0ab44ce698d4b1ada2cc3137bb))
* ngMocks.guts for easy start ([d19f958](https://github.com/help-me-mom/ng-mocks/commit/d19f95809a9e5802f201ddce31372deecf95393d))
* supporting fixture in ngMocks.find ([26da8a4](https://github.com/help-me-mom/ng-mocks/commit/26da8a47033897f8fae31e387bfdac29aec05dd1))


## [10.3.0](https://github.com/help-me-mom/ng-mocks/compare/v10.2.1...v10.3.0) (2020-10-18)


### Features

* ngMocks.faster execution of test suites ([a077d15](https://github.com/help-me-mom/ng-mocks/commit/a077d158b5d47549ef84de6af3b388659e103892))

### [10.2.1](https://github.com/help-me-mom/ng-mocks/compare/v10.2.0...v10.2.1) (2020-10-10)


### Bug Fixes

* builds with proper mappings ([72ed700](https://github.com/help-me-mom/ng-mocks/commit/72ed700e3570d3b65494019fc8a7c32513165fa7))
* mocking private service in component ([ab43a43](https://github.com/help-me-mom/ng-mocks/commit/ab43a438902dc01a75a16b82a6cbd2ef50b8c252)), closes [#198](https://github.com/help-me-mom/ng-mocks/issues/198)
* more intelligent overrides ([b17ff7f](https://github.com/help-me-mom/ng-mocks/commit/b17ff7ffedbda0867e7c6d7cdd06ffb70ea19e2a))
* more restricted stub signature ([fc179db](https://github.com/help-me-mom/ng-mocks/commit/fc179dbb5402aef4b915d20e8cb09bccf28bacdd))
* performance degration caused by .exclude feature ([3bf29ad](https://github.com/help-me-mom/ng-mocks/commit/3bf29ad9199169a33be6ba94f44a2d52176122a3))
* support of modules with providers in MockBuilder ([e0250e0](https://github.com/help-me-mom/ng-mocks/commit/e0250e04028e781a6ebb6c43f5d138b1660c8569)), closes [#197](https://github.com/help-me-mom/ng-mocks/issues/197)

## [10.2.0](https://github.com/help-me-mom/ng-mocks/compare/v10.1.3...v10.2.0) (2020-10-03)


### Features

* angular 11 support ([af50a72](https://github.com/help-me-mom/ng-mocks/commit/af50a720c7a821fec1e1aa5df773e04e33bef390))
* exclude feature in MockBuilder ([d839f27](https://github.com/help-me-mom/ng-mocks/commit/d839f2747cff9433fbbddeb34bb83943e096231d)), closes [#175](https://github.com/help-me-mom/ng-mocks/issues/175)
* mocked providers for kept declarations ([062d147](https://github.com/help-me-mom/ng-mocks/commit/062d147c0ccadce2621003c7e0c6f6143acc80b8)), closes [#172](https://github.com/help-me-mom/ng-mocks/issues/172)


### Bug Fixes

* cache break of MockComponent ([4b0ea25](https://github.com/help-me-mom/ng-mocks/commit/4b0ea25f7dbeac68433ce79460f12fdab57367c9)), closes [#96](https://github.com/help-me-mom/ng-mocks/issues/96)
* generic type constraint for ngMocks.stub tedious to write ([cccd96d](https://github.com/help-me-mom/ng-mocks/commit/cccd96d47e6ce3dc8277970d4ad0608d9b64f1a6)), closes [#166](https://github.com/help-me-mom/ng-mocks/issues/166)

### [10.1.3](https://github.com/help-me-mom/ng-mocks/compare/v10.1.2...v10.1.3) (2020-09-13)


### Bug Fixes

* cannot combine @Input decorators with query decorators ([7cda85d](https://github.com/help-me-mom/ng-mocks/commit/7cda85d385b140248d44adb25ae95b1914ca1c5f)), closes [#181](https://github.com/help-me-mom/ng-mocks/issues/181)
* respecting initialization of providers between tests ([2c7b47d](https://github.com/help-me-mom/ng-mocks/commit/2c7b47d7b9d6bdfe49596be225ddc28234265c65)), closes [#186](https://github.com/help-me-mom/ng-mocks/issues/186)

### [10.1.2](https://github.com/help-me-mom/ng-mocks/compare/v10.1.1...v10.1.2) (2020-08-09)


### Bug Fixes

* mocking getter and setters of services ([5a0ac7c](https://github.com/help-me-mom/ng-mocks/commit/5a0ac7c44d4c73d33ab4dad9ad583e31ad28ec5d)), closes [#177](https://github.com/help-me-mom/ng-mocks/issues/177)
* mocking imports after declarations ([ab3aa6f](https://github.com/help-me-mom/ng-mocks/commit/ab3aa6f91406d44cde530c0e6ec46e7af80d9b4c)), closes [#178](https://github.com/help-me-mom/ng-mocks/issues/178)

### [10.1.1](https://github.com/help-me-mom/ng-mocks/compare/v10.1.0...v10.1.1) (2020-07-21)


### Bug Fixes

* unexpected value '[object Object]' exported by the module ([148d659](https://github.com/help-me-mom/ng-mocks/commit/148d659515fae1d7653aa37c2a0880357ccf7b53)), closes [#173](https://github.com/help-me-mom/ng-mocks/issues/173)

## [10.1.0](https://github.com/help-me-mom/ng-mocks/compare/v10.0.2...v10.1.0) (2020-07-19)


### Features

* extending mocked things via MockInstance ([1ab2c9d](https://github.com/help-me-mom/ng-mocks/commit/1ab2c9d34b5a54074f9e30f4c39acd32a5f5d2c2)), closes [#170](https://github.com/help-me-mom/ng-mocks/issues/170)


### Bug Fixes

* injection of NG_VALIDATORS and NgControl ([82dd56a](https://github.com/help-me-mom/ng-mocks/commit/82dd56a78122e0dc6413d3e3d05bb345fbc0c118)), closes [#167](https://github.com/help-me-mom/ng-mocks/issues/167)

<a name="10.0.2"></a>
## [10.0.2](https://github.com/help-me-mom/ng-mocks/compare/v10.0.1...v10.0.2) (2020-07-12)


### Bug Fixes

* skipping mocking of EventManager and DomSharedStylesHost ([84b2720](https://github.com/help-me-mom/ng-mocks/commit/84b2720)), closes [#162](https://github.com/help-me-mom/ng-mocks/issues/162)



<a name="10.0.1"></a>
## [10.0.1](https://github.com/help-me-mom/ng-mocks/compare/v10.0.0...v10.0.1) (2020-07-12)


### Bug Fixes

* building es5 only that supports es2015 ([d11ed5a](https://github.com/help-me-mom/ng-mocks/commit/d11ed5a)), closes [#158](https://github.com/help-me-mom/ng-mocks/issues/158)
* respect mocks in tokens with useValue ([ccccfc6](https://github.com/help-me-mom/ng-mocks/commit/ccccfc6)), closes [#151](https://github.com/help-me-mom/ng-mocks/issues/151)
* smart injection of NG_VALUE_ACCESSOR ([ad37bf0](https://github.com/help-me-mom/ng-mocks/commit/ad37bf0)), closes [#157](https://github.com/help-me-mom/ng-mocks/issues/157)



<a name="10.0.0"></a>
# [10.0.0](https://github.com/help-me-mom/ng-mocks/compare/v9.6.4...v10.0.0) (2020-07-05)


### Features

* angular 10 support ([83debd2](https://github.com/help-me-mom/ng-mocks/commit/83debd2)), closes [#148](https://github.com/help-me-mom/ng-mocks/issues/148) [#149](https://github.com/help-me-mom/ng-mocks/issues/149)


### BREAKING CHANGES

* A10



<a name="9.6.4"></a>
## [9.6.4](https://github.com/help-me-mom/ng-mocks/compare/v9.6.3...v9.6.4) (2020-07-02)


### Bug Fixes

* respect of WithProviders without providers ([11ec9de](https://github.com/help-me-mom/ng-mocks/commit/11ec9de)), closes [#151](https://github.com/help-me-mom/ng-mocks/issues/151)



<a name="9.6.3"></a>
## [9.6.3](https://github.com/help-me-mom/ng-mocks/compare/v9.6.2...v9.6.3) (2020-06-23)


### Bug Fixes

* adding NG_VALUE_ACCESSOR only when necessary ([7f54464](https://github.com/help-me-mom/ng-mocks/commit/7f54464)), closes [#145](https://github.com/help-me-mom/ng-mocks/issues/145)



<a name="9.6.2"></a>
## [9.6.2](https://github.com/help-me-mom/ng-mocks/compare/v9.6.1...v9.6.2) (2020-06-21)


### Bug Fixes

* detection of empty modules in mock process ([7427e29](https://github.com/help-me-mom/ng-mocks/commit/7427e29)), closes [#142](https://github.com/help-me-mom/ng-mocks/issues/142)



<a name="9.6.1"></a>
## [9.6.1](https://github.com/help-me-mom/ng-mocks/compare/v9.6.0...v9.6.1) (2020-06-14)


### Bug Fixes

* better default type of MockedComponentFixture ([cca6994](https://github.com/help-me-mom/ng-mocks/commit/cca6994))



<a name="9.6.0"></a>
# [9.6.0](https://github.com/help-me-mom/ng-mocks/compare/v9.5.0...v9.6.0) (2020-06-14)


### Features

* e2e tests for all angular versions ([7bc10a7](https://github.com/help-me-mom/ng-mocks/commit/7bc10a7))
* mock-builder + lots of helpers ([6965ec0](https://github.com/help-me-mom/ng-mocks/commit/6965ec0)), closes [#44](https://github.com/help-me-mom/ng-mocks/issues/44)
* mock-render tries to mirror passed component ([cbb37ba](https://github.com/help-me-mom/ng-mocks/commit/cbb37ba)), closes [#137](https://github.com/help-me-mom/ng-mocks/issues/137)



<a name="9.5.0"></a>
# [9.5.0](https://github.com/help-me-mom/ng-mocks/compare/v9.4.0...v9.5.0) (2020-05-31)


### Bug Fixes

* ngMocks instead of MockHelper ([1db914c](https://github.com/help-me-mom/ng-mocks/commit/1db914c)), closes [#131](https://github.com/help-me-mom/ng-mocks/issues/131)
* throw a human readable error during resolve ([284e848](https://github.com/help-me-mom/ng-mocks/commit/284e848)), closes [#133](https://github.com/help-me-mom/ng-mocks/issues/133)


### Features

* ease of getting inputs and outputs ([af9a846](https://github.com/help-me-mom/ng-mocks/commit/af9a846)), closes [#129](https://github.com/help-me-mom/ng-mocks/issues/129)
* mock-service is typed and supports overrides ([805e37b](https://github.com/help-me-mom/ng-mocks/commit/805e37b)), closes [#122](https://github.com/help-me-mom/ng-mocks/issues/122)



<a name="9.4.0"></a>
# [9.4.0](https://github.com/help-me-mom/ng-mocks/compare/v9.3.0...v9.4.0) (2020-05-17)


### Bug Fixes

* better docs with current features ([c76209f](https://github.com/help-me-mom/ng-mocks/commit/c76209f))


### Features

* original instanceof and properties ([05dd90b](https://github.com/help-me-mom/ng-mocks/commit/05dd90b)), closes [#109](https://github.com/help-me-mom/ng-mocks/issues/109)



<a name="9.3.0"></a>
# [9.3.0](https://github.com/help-me-mom/ng-mocks/compare/v9.2.0...v9.3.0) (2020-05-10)


### Bug Fixes

* correct mocking of xxxChild(ren) decorators ([de7b8c3](https://github.com/help-me-mom/ng-mocks/commit/de7b8c3)), closes [#109](https://github.com/help-me-mom/ng-mocks/issues/109)
* improved helpers and documentation ([9ef24a0](https://github.com/help-me-mom/ng-mocks/commit/9ef24a0))
* more friendly return type of mock-render ([f4a3b79](https://github.com/help-me-mom/ng-mocks/commit/f4a3b79))
* remove usage of uknown ([26dfdb8](https://github.com/help-me-mom/ng-mocks/commit/26dfdb8))


### Features

* MockHelper with find, findAll and OrFail ([ecc4ac7](https://github.com/help-me-mom/ng-mocks/commit/ecc4ac7))
* providers for MockRender ([cb656b7](https://github.com/help-me-mom/ng-mocks/commit/cb656b7)), closes [#102](https://github.com/help-me-mom/ng-mocks/issues/102)
* support injection a library-related service mocker ([e6be694](https://github.com/help-me-mom/ng-mocks/commit/e6be694)), closes [#87](https://github.com/help-me-mom/ng-mocks/issues/87) [#103](https://github.com/help-me-mom/ng-mocks/issues/103)
* type-safe MockRender ([3bfe7bf](https://github.com/help-me-mom/ng-mocks/commit/3bfe7bf))



<a name="9.2.0"></a>
# 9.2.0 (2020-03-28)


### Bug Fixes

* respect of all parents ([b119547](https://github.com/help-me-mom/ng-mocks/commit/b119547))



<a name="9.1.0"></a>
# 9.1.0 (2020-03-21)


### Features

* Base class for directives and components ([f47853e](https://github.com/help-me-mom/ng-mocks/commit/f47853e))
* MockService ([62a87ea](https://github.com/help-me-mom/ng-mocks/commit/62a87ea))
* **mock-render:** option to detectChanges or not ([236b9e0](https://github.com/help-me-mom/ng-mocks/commit/236b9e0))



<a name="9.0.0"></a>
# 9.0.0 (2020-02-11)



<a name="8.1.0"></a>
# 8.1.0 (2019-07-17)


### Bug Fixes

* es2015 class declaration method mocking ([1286b10](https://github.com/help-me-mom/ng-mocks/commit/1286b10))



<a name="8.0.0"></a>
# 8.0.0 (2019-06-03)


### Features

* angular 8 ([29a5203](https://github.com/help-me-mom/ng-mocks/commit/29a5203))



<a name="7.8.0"></a>
# 7.8.0 (2019-05-14)


### Features

* **51:** Add mocked entry components to mocked modules ([a321b14](https://github.com/help-me-mom/ng-mocks/commit/a321b14))



<a name="7.7.2"></a>
## 7.7.2 (2019-04-26)



<a name="7.7.1"></a>
## 7.7.1 (2019-04-23)


### Bug Fixes

* **49:** stop caching mocked pipes ([058d66e](https://github.com/help-me-mom/ng-mocks/commit/058d66e))



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

* trim innerText that was getting a new line from a div ([f883ad0](https://github.com/help-me-mom/ng-mocks/commit/f883ad0))



<a name="7.0.1"></a>
## 7.0.1 (2018-10-26)


### Bug Fixes

* package-lock out of sync ([6fe7d36](https://github.com/help-me-mom/ng-mocks/commit/6fe7d36))



<a name="7.0.0"></a>
# 7.0.0 (2018-10-26)



<a name="6.3.0"></a>
# 6.3.0 (2018-10-17)


### Features

* **MockDirective:** added the ability to use ViewChild/ViewChildren etc with MockDirective ([8853e87](https://github.com/help-me-mom/ng-mocks/commit/8853e87))



<a name="6.2.3"></a>
## 6.2.3 (2018-10-02)


### Bug Fixes

* **MockPlural:** removing generic type from MockComponents, Directives, and Pipes ([919a06c](https://github.com/help-me-mom/ng-mocks/commit/919a06c))



<a name="6.2.2"></a>
## 6.2.2 (2018-10-02)


### Bug Fixes

* **MockModule:** Never mock CommonModule ([119dd80](https://github.com/help-me-mom/ng-mocks/commit/119dd80))



<a name="6.2.1"></a>
## 6.2.1 (2018-08-28)



<a name="6.2.0"></a>
# 6.2.0 (2018-08-28)


### Features

* add a MockedComponent type ([fe547af](https://github.com/help-me-mom/ng-mocks/commit/fe547af))



<a name="6.1.0"></a>
# 6.1.0 (2018-06-04)


### Features

* support structural directives ([050e70c](https://github.com/help-me-mom/ng-mocks/commit/050e70c))



<a name="6.0.1"></a>
## 6.0.1 (2018-05-15)


### Bug Fixes

* package json peer dep version range ([8ad3834](https://github.com/help-me-mom/ng-mocks/commit/8ad3834))



<a name="6.0.0"></a>
# 6.0.0 (2018-05-14)


### Features

* support angular 6 and test 5 & 6 in travis ([5bc9331](https://github.com/help-me-mom/ng-mocks/commit/5bc9331))



<a name="5.3.0"></a>
# 5.3.0 (2018-04-05)


### Features

* MockOf - Include mocked class names in mock class names ([8b149f5](https://github.com/help-me-mom/ng-mocks/commit/8b149f5))



<a name="5.2.0"></a>
# 5.2.0 (2018-03-30)


### Features

* Use Angular annotation resolvers ([4050d10](https://github.com/help-me-mom/ng-mocks/commit/4050d10))



<a name="5.1.0"></a>
# 5.1.0 (2018-03-25)


### Bug Fixes

* Add a null check for decorator args ([1058044](https://github.com/help-me-mom/ng-mocks/commit/1058044))


### Features

* Support Angular propDecorators inputs and outputs ([add374d](https://github.com/help-me-mom/ng-mocks/commit/add374d))



<a name="5.0.0"></a>
# 5.0.0 (2018-03-25)


### Bug Fixes

* Fix bad return value from mock-directive ([4659a32](https://github.com/help-me-mom/ng-mocks/commit/4659a32))
* multiple decorators on an input ([13874b9](https://github.com/help-me-mom/ng-mocks/commit/13874b9))
* Outdated package-lock ([7623e98](https://github.com/help-me-mom/ng-mocks/commit/7623e98))


### Features

* add functions to mass mock ([fee5a03](https://github.com/help-me-mom/ng-mocks/commit/fee5a03))
* Cleanup exports and export MockDeclaration from MockModule ([9fe2bb1](https://github.com/help-me-mom/ng-mocks/commit/9fe2bb1))
* mock directives now have event emitter bound outputs ([bac1ca5](https://github.com/help-me-mom/ng-mocks/commit/bac1ca5))



<a name="5.0.0-rc5"></a>
# 5.0.0-rc5 (2018-03-07)


### Bug Fixes

* package json typings location ([5f6fde0](https://github.com/help-me-mom/ng-mocks/commit/5f6fde0))



<a name="5.0.0-rc4"></a>
# 5.0.0-rc4 (2018-03-07)



<a name="5.0.0-rc3"></a>
# 5.0.0-rc3 (2018-03-07)


### Bug Fixes

* integrate mock-pipe ([d747517](https://github.com/help-me-mom/ng-mocks/commit/d747517))
* mock_direcive integration ([7f02f7b](https://github.com/help-me-mom/ng-mocks/commit/7f02f7b))


### Features

* merge in mock-module ([05eaebe](https://github.com/help-me-mom/ng-mocks/commit/05eaebe))
* support inputs and outputs from extended components ([fc46838](https://github.com/help-me-mom/ng-mocks/commit/fc46838))



<a name="5.0.0-rc1"></a>
# 5.0.0-rc1 (2018-02-10)


### Bug Fixes

* add reflect-metadata back to devDeps ([385c9c4](https://github.com/help-me-mom/ng-mocks/commit/385c9c4))
* Add support for directives with a different kind of meta ([0bd38cc](https://github.com/help-me-mom/ng-mocks/commit/0bd38cc))
* add testbed test that exposed now fixed issue ([610cbdc](https://github.com/help-me-mom/ng-mocks/commit/610cbdc))
* forgot how to use js reduce ([de518d4](https://github.com/help-me-mom/ng-mocks/commit/de518d4))
* instantiate event emitters in component constructor ([fb4b97d](https://github.com/help-me-mom/ng-mocks/commit/fb4b97d))
* module exports is now all declarations ([fbb0e73](https://github.com/help-me-mom/ng-mocks/commit/fbb0e73))
* output binding ([59f476d](https://github.com/help-me-mom/ng-mocks/commit/59f476d))
* works with component w/o inputs or outputs ([b3d38e7](https://github.com/help-me-mom/ng-mocks/commit/b3d38e7))


### Features

* add exportAs and alias support ([14a1474](https://github.com/help-me-mom/ng-mocks/commit/14a1474))
* add support for exportAs and input aliases ([9b42a21](https://github.com/help-me-mom/ng-mocks/commit/9b42a21))
* Adding angular 2 compatibility and moving to peerDependency ([#3](https://github.com/help-me-mom/ng-mocks/issues/3)) ([4bd93db](https://github.com/help-me-mom/ng-mocks/commit/4bd93db))
* component mock implements control value accessor to support ngModel binding ([67ea7c4](https://github.com/help-me-mom/ng-mocks/commit/67ea7c4))
* initial implementation ([893f83b](https://github.com/help-me-mom/ng-mocks/commit/893f83b))
* memoize function by arg ([031e3a6](https://github.com/help-me-mom/ng-mocks/commit/031e3a6))
* memoize function by arg ([cac00b3](https://github.com/help-me-mom/ng-mocks/commit/cac00b3))
* mock module providers ([49b2272](https://github.com/help-me-mom/ng-mocks/commit/49b2272))
* Upgrade to angular 5 and pull in testbed for tests ([7df64a8](https://github.com/help-me-mom/ng-mocks/commit/7df64a8))
