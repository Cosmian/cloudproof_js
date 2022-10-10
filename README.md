# Cosmian Javascript Lib

The library provides a Typescript friendly API to the **Cloudproof Encryption** product of the [Cosmian Ubiquitous Encryption platform](https://cosmian.com).


## Getting started


Please [check the online documentation](https://docs.cosmian.com/cloudproof_encryption/use_cases_benefits/) for details on using the CloudProof APIs.


In addition, please have a look at the following tests for implementation examples:

 - [TestCoverCrypt](./tests/crypto/abe/cover_crypt/all.test.ts) for using the CoverCrypt scheme with WASM library
 - [TestGpsw](./tests/crypto/abe/gpsw/all.test.ts) for using the ABE GPSW scheme with WASM library
 - [TestFindex](./tests/interface/findex/upsert_search.test.ts) for using the SSE Findex scheme with WASM library


## Using in Javascript projects

This library is free software and is available on NPM public repository.

```bash
npm i cloudproof_js
```

## Versions Correspondence

Local encryption and decryption with [GPSW](https://github.com/Cosmian/abe_gpsw) or [CoverCrypt](https://github.com/Cosmian/cover_crypt) and SSE Findex Cosmian scheme use WASM librairies which are transparent for Javascript/Typescript usage.

This table shows the minimum versions correspondence between the various components.

KMS Server | Javascript Lib | GPSW lib | CoverCrypt lib | Findex
-----------|----------------|----------|----------------|-------
2.2.0      | 1.0.6          | 2.0.1    | 6.0.1          | 0.5.0
2.2.0      | 3.0.0          | 2.0.1    | 6.0.1          | 0.7.0


## npm version

{
  cloudproof_js: '3.0.2',
  npm: '6.14.17',
  ares: '1.18.1',
  brotli: '1.0.9',
  cldr: '40.0',
  icu: '70.1',
  llhttp: '2.1.4',
  modules: '83',
  napi: '8',
  nghttp2: '1.42.0',
  node: '14.19.2',
  openssl: '1.1.1n',
  tz: '2021a3',
  unicode: '14.0',
  uv: '1.42.0',
  v8: '8.4.371.23-node.87',
  zlib: '1.2.11'
}
