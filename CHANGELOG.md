# Changelog

## [1.4.0](https://github.com/mcanevet/nonogram/compare/v1.3.0...v1.4.0) (2026-03-17)


### Features

* add drag to paint ([644b62f](https://github.com/mcanevet/nonogram/commit/644b62f6667d0c69528e3529b9a161f6734de38e))
* add variety, preview, and fix win detection ([1475f41](https://github.com/mcanevet/nonogram/commit/1475f41a946f0503651e232dddfb757c9703fe3f))


### Bug Fixes

* protect already-set cells during drag ([04575c2](https://github.com/mcanevet/nonogram/commit/04575c2ab6f833c6cdac012efd4a57388dcaebd4))

## [1.3.0](https://github.com/mcanevet/nonogram/compare/v1.2.0...v1.3.0) (2026-03-17)


### Features

* generate puzzles from pre-defined emoji patterns ([fddaae7](https://github.com/mcanevet/nonogram/commit/fddaae7a4fe8eee9941ad3ba65d4c482ddb8fdc0))


### Bug Fixes

* add iOS 18+ haptic feedback support ([8cf77c2](https://github.com/mcanevet/nonogram/commit/8cf77c27fc9c43b851ec09e8344beec4b0b01f5c))
* enable unique solution validation for 5x5 grids ([d8db569](https://github.com/mcanevet/nonogram/commit/d8db569eb5b03f6ae0837e75af902ad24db01c5a))
* implement efficient row-based unique solution validator ([df0c383](https://github.com/mcanevet/nonogram/commit/df0c38391eaa8b5d663cb455e673b05e85b8a0a7))
* improve unique solution validation with random solving ([ca6860f](https://github.com/mcanevet/nonogram/commit/ca6860f14dfcf09c12f73b5a0d69be93b74412b8))

## [1.2.0](https://github.com/mcanevet/nonogram/compare/v1.1.0...v1.2.0) (2026-03-16)


### Features

* add Zen mode with no lives checking ([b758939](https://github.com/mcanevet/nonogram/commit/b7589399e8d208a12f0bd566053f4aabdd87e7c4))
* hide auto-cross and highlight options in Zen mode ([808cfc6](https://github.com/mcanevet/nonogram/commit/808cfc638dcb7522f2fb92aae4bfde9c15958cc0))
* hide fill/cross toggle button in Zen mode ([27f5a84](https://github.com/mcanevet/nonogram/commit/27f5a8429fdf7351a0b78338b3174cbeeec7d524))
* in Zen mode, click cycles fill-&gt;cross->empty ([77d85a9](https://github.com/mcanevet/nonogram/commit/77d85a9f4b53946878ec2f10b65c6d8ed09b01b0))
* make Zen mode the default ([8277c26](https://github.com/mcanevet/nonogram/commit/8277c26b7937ca28c7631ac5f4f6e0118e95323d))


### Bug Fixes

* add favicon.svg to fix 404 errors ([f757aab](https://github.com/mcanevet/nonogram/commit/f757aab36439dfd0364e2994f648f8de051fb6f1))
* add styling for gameMode selector and remove deprecated meta tag ([f243e25](https://github.com/mcanevet/nonogram/commit/f243e2515a15e73728851eb21c5bc873011e7dbf))
* always show correct on error in classic mode ([c4b37fb](https://github.com/mcanevet/nonogram/commit/c4b37fb345917f98e2391fd645ce70d841b25cc0))
* improve PWA caching to avoid stale content ([51fd7c4](https://github.com/mcanevet/nonogram/commit/51fd7c47c228122f80bb4f1b95cfa2b857caaec3))

## [1.1.0](https://github.com/mcanevet/nonogram/compare/v1.0.0...v1.1.0) (2026-03-16)


### Features

* add release-please action ([8b0725a](https://github.com/mcanevet/nonogram/commit/8b0725acd1d24d43eda4a38ee2f7f06dc71bee43))
* display version in interface ([f3e7ee9](https://github.com/mcanevet/nonogram/commit/f3e7ee9b2d6acbebfacdd7b6b094cf53010dbf33))


### Bug Fixes

* add favicon and mobile-web-app-capable meta tag ([b351783](https://github.com/mcanevet/nonogram/commit/b3517830981360d9f5ae16b47e1aa5e3b60053f3))
* handle file:// protocol gracefully ([d384a3e](https://github.com/mcanevet/nonogram/commit/d384a3e3cdbdd018ac8eba7087a87ffc3995a80b))
* restore game.js and fix version display bugs ([540fa15](https://github.com/mcanevet/nonogram/commit/540fa15d7589a2c717727e765e93ebc18a8af680))
* update service worker cache version ([4e88e42](https://github.com/mcanevet/nonogram/commit/4e88e42881faba387b081bd9b9df1a10dbb59c8f))
