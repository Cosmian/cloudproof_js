# Cloudproof Javascript Library

![Build status](https://github.com/Cosmian/cloudproof_js/actions/workflows/ci.yml/badge.svg?branch=main)

The library provides a Typescript-friendly API to the **Cloudproof Encryption** product of the [Cosmian Ubiquitous Encryption platform](https://cosmian.com).

<!-- toc -->

- [Licensing](#licensing)
- [Cryptographic primitives](#cryptographic-primitives)
- [Getting started](#getting-started)
- [Using in Javascript projects](#using-in-javascript-projects)
- [Versions Correspondence](#versions-correspondence)

<!-- tocstop -->

## Licensing

The library is available under a dual licensing scheme Affero GPL/v3 and commercial. See [LICENSE.md](LICENSE.md) for details.

## Cryptographic primitives

The library is based on:

- [CoverCrypt](https://github.com/Cosmian/cover_crypt) algorithm which allows
  creating ciphertexts for a set of attributes and issuing user keys with access
  policies over these attributes. `CoverCrypt` offers Post-Quantum resistance.

- [Findex](https://github.com/Cosmian/findex) which is a cryptographic protocol designed to securely make search queries on
  an untrusted cloud server. Thanks to its encrypted indexes, large databases can
  securely be outsourced without compromising usability.

- [FPE](https://github.com/Cosmian/cloudproof_rust/tree/main/crates/fpe) provides `Format Preserving Encryption` (FPE) techniques for use in a zero-trust environment. These techniques are based on FPE-FF1 which is described in [NIST:800-38G](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-38g.pdf).

- [Anonymization](https://github.com/Cosmian/cloudproof_rust/tree/main/crates/anonymization): `Data anonymization` is the process of transforming data in such a way that it can no longer be used to identify individuals without the use of additional information. This is often done to protect the privacy of individuals whose data is being collected or processed.

## Getting started

Please [check the online documentation](https://docs.cosmian.com/) for details on using the CloudProof APIs.

You can also look the [`examples` directory](./examples) for examples with multiple JS frameworks/technologies (the [`README`](./examples/README.md) of the [`examples`](./examples) folder can guide you to the best example for you use case).

## Using in Javascript projects

This library is free software and is available on NPM public repository.

As a pre-requisite, the WASM binaries required for Findex and CoverCrypt must be fetched (or be manually copied from <https://package.cosmian.com> into `src/pkg` directory):

```bash
python3 scripts/download_wasm.py
```

And next:

```bash
npm i cloudproof_js
```

(version before 3.1.0 were called cosmian_js_lib)

## Versions Correspondence

Local encryption and decryption with [CoverCrypt](https://github.com/Cosmian/cover_crypt) and SSE Findex Cosmian scheme use WASM libraries which are transparent for Javascript/Typescript usage.

This table shows the minimum version correspondence between the various components.

| `cloudproof_js` | CoverCrypt lib | Findex | KMS Server |
| --------------- | -------------- | ------ | ---------- |
| 1.0.6           | 6.0.1          | 0.5.0  | 2.2.0      |
| 3.1.0           | 6.0.7          | 0.7.0  | 2.3.0      |
| 3.1.0, 4.\*     | 6.0.7          | 0.7.0  | 2.3.0      |
| 5.0.0           | 7.0.0          | 0.10.0 | 3.0.0      |
| 6.0.0           | 8.0.0          | 1.0.0  | 4.0.0      |
| 6.0.1           | 8.0.0          | 2.0.0  | 4.0.0      |
| 7.0.0, 7.0.1    | 10.0.0         | 2.0.1  | 4.2.0      |

From the version 8.0.0, `cloudproof_js` depends on [cloudproof_rust](https://github.com/Cosmian/cloudproof_rust) which wraps the interfaces of `CoverCrypt` and `Findex`.

| `cloudproof_js` | Cloudproof Rust lib | KMS Server |
| --------------- | ------------------- | ---------- |
| 8.0.0           | 1.0.0               | 4.2.0      |
| 8.1.0           | 1.1.0               | 4.3.0      |
| 9.0.0           | 2.0.1               | 4.3.0      |
| 9.1.0,9.1.1     | 2.1.0               | 4.3.0      |
| 9.2.0           | 2.2.1               | 4.5.0      |
| 9.3.0           | 2.2.3               | 4.6.0      |
| 9.4.0,9.4.1     | 2.2.4               | 4.7.0      |
| 9.5.0           | 2.3.0               | 4.9.0      |
| 9.5.1           | 2.3.0               | 4.9.1      |
| 9.6.0           | 2.4.0               | 4.9.1      |
