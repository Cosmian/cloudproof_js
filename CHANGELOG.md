# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Features

- upgrade Findex (v3.0.0 -> v4.0.0):
  - change indexed values size (require a reset of the index database)
  - change search interface
    - change parameter order
    - remove `maxResultsPerKeyword`
    - remove `maxGraphDepth`
    - remove `insecureFetchChainsBatchSize`
    - searching for a non indexed keyword leads to an empty array for this
      keyword in the search results instead of this keyword being missing from
      the results.
  - change upsert interface:
    - change parameter order
    - add deletions

## [8.1.0] - 2023-04-06

### Features

- Add Format-Preserving-Encryption (FPE):
  - add integer and big integers encryption (as string with radix and digits)
  - add string encryption according to given alphabet
    - "numeric": 0123456789
    - "hexa_decimal": 0123456789abcdef
    - "alpha_lower": abcdefghijklmnopqrstuvwxyz
    - "alpha_upper": ABCDEFGHIJKLMNOPQRSTUVWXYZ
    - "alpha": abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
    - "alpha_numeric": 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
    - "utf": creates an Alphabet with the first 63489 (~2^16) Unicode characters
    - "chinese": creates an Alphabet with the Chinese characters
    - "latin1sup": creates an Alphabet with the latin-1 and latin1-supplement characters (supports French)
    - "latin1sup_alphanum": creates an Alphabet with the latin-1 and latin1-supplement characters but without the non alphanumeric characters (supports French)
  - add float encryption

## [8.0.0] - 2023-03-08

### Features

- Support of CoverCrypt 11.0 and Findex 3.0 (#106)

## [7.1.0] - 2023-03-01

### Features

- Create `ProgressResult` object and add tests
- Findex Cloud beta

### Miscellaneous Tasks

- `Location` conversions for numbers don't use LEB128 anymore but big-endian 8 bytes

### Testing

- Uniformize findex dataset

### Ci

- Add cross tests

---

## [7.0.1] - 2023-02-17

### Testing

- Add source code of public_doc

---

## [7.0.0] - 2023-02-03

### Bug Fixes

- Download wasm on specific versions only (except for github release)
- Use KMS version to 4.2.0

### Features

- Update `SearchResult` to use `Location` only
- Support CoverCrypt v10.0

### Miscellaneous Tasks

- Download wasm from package.cosmian.com
- Prepare next versions of findex and cover_crypt

---

## [6.0.1] - 2023-01-13

### Added

- Add `insecureFetchChainsBatchSize` argument to `Findex.search` to reduce the number of `fetchChains` calls during searches

### Changed

- `fetchChains` calls are now run in async parallel

---

## [6.0.0] - 2022-12-22

### Added

- NodeJS support
- encrypt/decrypt with the KMS
- `Location.fromUuid()`
- Verify non regression test vectors for CoverCrypt
- New simple API for CoverCrypt (new functions `encrypt`, `decrypt`, `generateMasterKeys`, `generateUserSecretKey` and `rotateAttributes`)

### Changed

- Findex 1.0
- Simplify `search` signature (move optional options to an `options` object at the end)
- `search` now return `SearchResults`, use `locations()` to get all the locations, use `getAllIndexedValues()` to get the full `IndexedValue` list
- `decrypt` function for CoverCrypt now return an object containing the decrypted header metadata and the plaintext decrypted value
- WASM files are now base64 inline in the lib
- `KmipClient` is now `KmsClient`
- Removed `client.post()` function, please use the specific functions on the `KmsClient` object.
- Refactor the KMS structures (snake case to camel case for properties, change some types…)
- Rename `*abe*` to `*CoverCrypt*` in KMS functions
- Rename `ClearTextHeader` to `PlaintextHeader`
- Rename `additionalData` to `headerMetadata`
- Switch from Jest to Vitest

### Removed

- `options.generateGraphs` in the `upsert` function. Please use `generateAliases()` to build the keywords/nextwords (see VueJS or ReactJS examples)
- In `Location`, `Keyword` and `Label`: `fromUtf8String()`, replaced by `fromString()`

### Fixed

- `AccessPolicy.toKmipJson` and `AccessPolicy.toVendorAttribute` are now async (because they call the WASM)

---

## [5.1.0] - 2022-11-17

### Added

- Cosmian cloudproof Javascript demonstration

### Changed

- update `cover_crypt` to 7.1.0

### Fixed

- fix TypeScript 4.9
- fix E2E test and small HTML tweaks

---

## [5.0.1] - 2022-11-15

### Added

### Changed

- add KMS E2E tests
- improve E2E tests for random failures

### Fixed

- fix KMS client using class names for KMIP tags which interfere with bundlers renaming classes with short names

---

## [5.0.0] - 2022-11-08

### Added

- VueJS and ReactJS dome
- example for a CoverCrypt encryption using Webpack 5

### Changed

- refactor wasm loading to async functions
- simplify signatures for encrypt/decrypt
- update findex to 0.10.0
- update cover crypt to 7.0.1
- update webpack-dev-server version to `4.11.1`

### Fixed

- Support for NodeJS 14 and NodeJS 16
- CoverCrypt encryption UID is now optional
- fix all eslint errors

### Removed

---

## [4.0.0] - 2022-10-24

### Added

### Changed

- update findex to 0.9.0: no custom conversions but with direct reflection in JS types

### Fixed

### Removed

---

## [3.2.2] - 2022-10-21

### Added

### Changed

- update findex to 0.8.0

### Fixed

### Removed

---

## [3.2.1] - 2022-10-19

### Added

### Changed

- Strip packaging (removed tests folder)

### Fixed

- search of the simple API

### Removed

- Remove worker and worker pool
- Remove GPSW

---

## [3.2.0] - 2022-10-17

### Added

- expose Findex Simple

### Changed

### Fixed

### Removed

---

## [3.1.1] - 2022-10-17

### Added

### Changed

- Update `cosmian_cover_crypt` to 6.0.8
- Update `cosmian_findex` to 0.7.2
- Update `cosmian_abe_gpsw` to 2.0.3

### Fixed

### Removed

---

## [3.1.0] - 2022-10-13

### Added

- Support for KMIP calls to KMS

### Changed

- Updated License- Increase Axios timeout to 2 minutes
- Bump KMS version from 2.2.0 to 2.3.0

### Fixed

### Removed

---

## [3.0.4] - 2022-10-14

### Added

- CI: use KMS version from Gitlab version
- Use port 5433 for postgres container on Gitlab

### Changed

### Fixed

### Removed

---

## [3.0.3] - 2022-10-13

### Added

- Add timings in console for the demo

### Changed

### Fixed

- Fix purging database in demo

### Removed

---

## [3.0.2] - 2022-10-07

### Added

### Changed

- Rename `cosmian_js_lib` to `cloudproof_js`
- Rename WASM libraries to `cosmian_*`

---

## [3.0.1] - 2022-10-05

### Added

- Add MIT license

### Changed

- Make ABE/CC decryption workers exportable (converting worker.ts to JS and allow JS to be compiled)
- Uniformize encryption demos functions using `encryptUsersPerCountryAndDepartment`

### Fixed

- Fix cors problem by specifying port and public host in webpack cli

### Removed

---

## [3.0.0] - 2022-09-30

### Added

- `graph_upsert`
- test for `graph_upsert`
- `FindexMasterKey` type

### Changed

- signature of the `search`

### Fixed

### Removed

---

## [2.0.0] - 2022-09-26

### Added

- Indexes compaction for Findex
- Also package for CommonJS/Node
- Findex implementation with Redis database (upsert and search)
- Add tests for Cloudproof or Findex only (for PostgRest and Redis)

### Changed

- Reorganize code tree
- Use and apply eslint standard style

### Fixed

- Findex interface with `Uint8Array` in place of `string`

### Removed

---

## [1.0.8] - 2022-09-16

### Added

- Add README.md

### Changed

- Re-enable ABE demo via abe.html

### Fixed

- Fix packaging and exports all modules for Typescript/Javascript
- [Findex tests/PostgREST] Increase again delay after users provisioning

### Removed

---

## [1.0.7] - 2022-09-16

### Added

### Changed

### Fixed

- Fixed docker-compose.yml behind a reverse proxy

### Removed

---

## [1.0.6] - 2022-09-15

### Added

### Changed

- update Findex to version v0.5.0

### Fixed

### Removed

---

## [1.0.5] - 2022-09-07

### Added

- CI tests on Findex: upsert+search using Findex WASM package
- Auto-deploy demo on tags to cloudproof-cosmian.com

### Changed

- Source tree reorganization, splitting demos apart

### Fixed

### Removed

---

## [1.0.4] - 2022-09-05

### Added

### Changed

- Update `CoverCrypt` to 6.0.1
- Update `AbeGPSW` to 2.0.1
- Update Policy to conform new format

### Fixed

- LEB128 serialization

### Removed

---

## [1.0.3] - 2022-08-30

### Added

- Enable JEST tests. WASM libraries are tested from `nodejs` WASM build.
- Enable Github & Gitlab CI

### Changed

- Update `CoverCrypt` to `3.1.0`
- Use npm packages for WASM libraries

### Fixed

### Removed

---

## [1.0.2] - 2022-08-19

### Added

- Add findex wasm implementation using `findex` v.0.3.0

### Changed

- Demo split in two : findex only, findex using covercrypt
- Depends on `abe_gpsw` v0.8.0 and `cover_crypt` v3.0.1

### Fixed

### Removed

---

## [1.0.1] - 2022-06-08

### Added

- Add ABE key generation: master key generation and user decryption key generation
- Add attributes rotation

### Changed

- Depends on `abe_gpsw` v0.8.0 and `cover_crypt` v3.0.1

### Fixed

### Removed

---

## [1.0.0] - 2022-05-17

### Added

- Implementation of ABE-GPSW/AES hybrid encryption/decryption using `abe_gpsw` v0.6.9
- Implementation of ABE-CovCrypt/AES hybrid encryption/decryption using `cover_crypt` v2.0.0
- Implementation of HKDF HMAC-SHA256

### Changed

### Fixed

### Removed

---
