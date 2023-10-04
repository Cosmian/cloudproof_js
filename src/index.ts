import { setAnonymizationInit } from "./anonymization/init"
import anonymization_wasm from "./pkg/anonymization/cloudproof_anonymization_bg.wasm"

import { setAesGcmInit } from "./aesgcm/init"
import aesgcm_wasm from "./pkg/aesgcm/cloudproof_aesgcm_bg.wasm"

import { setEciesInit } from "./ecies/init"
import ecies_wasm from "./pkg/ecies/cloudproof_ecies_bg.wasm"

import { setCoverCryptInit } from "./cover_crypt/init"
import cover_crypt_wasm from "./pkg/cover_crypt/cloudproof_cover_crypt_bg.wasm"

import { setFindexInit } from "./findex/init"
import findex_wasm from "./pkg/findex/cloudproof_findex_bg.wasm"

import { setFpeInit } from "./fpe/fpe"
import fpe_wasm from "./pkg/fpe/cloudproof_fpe_bg.wasm"

export * from "./aesgcm/init"
export * from "./anonymization/init"
export { type CoverCryptHybridDecryption } from "./cover_crypt/decryption"
export { type CoverCryptHybridEncryption } from "./cover_crypt/encryption"
export * from "./cover_crypt/init"
export * from "./cover_crypt/interfaces/access_policy"
export * from "./cover_crypt/interfaces/encrypted_header"
export * from "./cover_crypt/interfaces/encryption_parameters"
export * from "./cover_crypt/interfaces/plaintext_header"
export * from "./cover_crypt/interfaces/policy"
export {
  CoverCryptMasterKey,
  type CoverCryptKeyGeneration,
} from "./cover_crypt/key_generation"
export * from "./ecies/init"
export * from "./findex/findex_cloud"
export * from "./findex/init"
export * from "./fpe/fpe"
export { logger } from "./utils/logger"
export {
  deserializeList,
  hexDecode,
  hexEncode,
  sanitizeString,
  toBeBytes,
} from "./utils/utils"

// @ts-expect-error @ts-ignore-error
setAesGcmInit(() => aesgcm_wasm())

// @ts-expect-error @ts-ignore-error
setAnonymizationInit(() => anonymization_wasm())

// @ts-expect-error @ts-ignore-error
setCoverCryptInit(() => cover_crypt_wasm())

// @ts-expect-error @ts-ignore-error
setEciesInit(() => ecies_wasm())

// @ts-expect-error @ts-ignore-error
setFindexInit(() => findex_wasm())

// @ts-expect-error @ts-ignore-error
setFpeInit(() => fpe_wasm())
