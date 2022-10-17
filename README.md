# Cloudproof Javascript Lib

The library provides a Typescript-friendly API to the **Cloudproof Encryption** product of the [Cosmian Ubiquitous Encryption platform](https://cosmian.com).

## Getting started

Please [check the online documentation](https://docs.cosmian.com/cloudproof_encryption/use_cases_benefits/) for details on using the CloudProof APIs.

In addition, please have a look at the following tests for implementation examples:

- [TestCoverCrypt](./tests/crypto/abe/cover_crypt/all.test.ts) for using the CoverCrypt scheme with the WASM library
- [TestGpsw](./tests/crypto/abe/gpsw/all.test.ts) for using the ABE GPSW scheme with the WASM library
- [TestFindex](./tests/interface/findex/upsert_search.test.ts) for using the SSE Findex scheme with the WASM library

## Using in Javascript projects

This library is free software and is available on NPM public repository.

```bash
npm i cloudproof_js
```

(version before 3.1.0 were called cosmian_js_lib)

## Versions Correspondence

Local encryption and decryption with [GPSW](https://github.com/Cosmian/abe_gpsw) or [CoverCrypt](https://github.com/Cosmian/cover_crypt) and SSE Findex Cosmian scheme use WASM libraries which are transparent for Javascript/Typescript usage.

This table shows the minimum version correspondence between the various components.

| KMS Server | Javascript Lib | GPSW lib | CoverCrypt lib | Findex |
| ---------- | -------------- | -------- | -------------- | ------ |
| 2.2.0      | 1.0.6          | 2.0.1    | 6.0.1          | 0.5.0  |
| 2.3.0      | 3.1.0          | 2.0.2    | 6.0.7          | 0.7.0  |

## npm version

```Json
{
  cloudproof_js: '3.1.0',
  npm: '8.6.0',
  node: '18.0.0',
  v8: '10.1.124.8-node.13',
  uv: '1.43.0',
  zlib: '1.2.11',
  brotli: '1.0.9',
  ares: '1.18.1',
  modules: '108',
  nghttp2: '1.47.0',
  napi: '8',
  llhttp: '6.0.4',
  openssl: '3.0.2+quic',
  cldr: '41.0',
  icu: '71.1',
  tz: '2022a',
  unicode: '14.0',
  ngtcp2: '0.1.0-DEV',
  nghttp3: '0.1.0-DEV'
}
```
