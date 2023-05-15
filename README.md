# Cloudproof Javascript Library

![Build status](https://github.com/Cosmian/cloudproof_js/actions/workflows/ci.yml/badge.svg)

The library provides a Typescript-friendly API to the **Cloudproof Encryption** product of the [Cosmian Ubiquitous Encryption platform](https://cosmian.com).

<!-- toc -->

- [Getting started](#getting-started)
- [Using in Javascript projects](#using-in-javascript-projects)
- [Versions Correspondence](#versions-correspondence)

<!-- tocstop -->

## Getting started

Please [check the online documentation](https://docs.cosmian.com/cloudproof_encryption/use_cases_benefits/) for details on using the CloudProof APIs.

You can also look the [`examples` directory](./examples) for examples with multiple JS frameworks/technologies (the [`README`](./examples/README.md) of the [`examples`](./examples) folder can guide you to the best example for you use case).

## Using in Javascript projects

This library is free software and is available on NPM public repository.

```bash
npm i cloudproof_js
```

(version before 3.1.0 were called cosmian_js_lib)

## Versions Correspondence

Local encryption and decryption with [CoverCrypt](https://github.com/Cosmian/cover_crypt) and SSE Findex Cosmian scheme use WASM libraries which are transparent for Javascript/Typescript usage.

This table shows the minimum version correspondence between the various components.

| `cloudproof_js` | CoverCrypt lib | Findex | KMS Server |
|-----------------|----------------|--------|------------|
| 1.0.6           | 6.0.1          | 0.5.0  | 2.2.0      |
| 3.1.0           | 6.0.7          | 0.7.0  | 2.3.0      |
| 3.1.0, 4.\*     | 6.0.7          | 0.7.0  | 2.3.0      |
| 5.0.0           | 7.0.0          | 0.10.0 | 3.0.0      |
| 6.0.0, 6.0.1    | 8.0.0          | 1.0.0  | 4.0.0      |
| 6.0.3           | 8.0.2          | 2.0.2  | 4.0.1      |
| 6.0.4           | 8.0.2          | 2.0.3  | 4.0.1      |
