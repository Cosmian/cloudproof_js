<h1>Cosmian JS Lib</h1>


## Building

Cosmian JS lib is exposed as a library and a small demo webapp.

### Library

To build the library, run `npx tsc`.

The library is available in `dist`

### Demo webapp

To build and start the demo webapp, run `npw webpack serve`.

The demo will be available at http://localhost:8080


### Cryptographic libraries

Pre-compiled versions of `CoverCrypt`, `GPSW` and `Findex` are available in the `wasm_lib` directory.

To build a new version of those, git clone them in a directory `crypto_libs` then run `./build_and_run.sh crypto_lib` to build them, compile the js lib and launch the demo app.



