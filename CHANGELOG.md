# Changelog

All notable changes to this project will be documented in this file.

---
## [3.0.1] - 2022-10-05
### Added
### Changed
- Uniformize encryption demos functions
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
