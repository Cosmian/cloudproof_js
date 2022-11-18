import cover_crypt_wasm from "./pkg/cover_crypt/cosmian_cover_crypt_bg.wasm"
import { setCoverCryptInit } from "./crypto/abe/core/cover_crypt"

import findex_wasm from "./pkg/findex/cosmian_findex_bg.wasm"
import { setFindexInit } from "./crypto/sse/findex/simple"

export * from "./crypto/sse/findex/simple"
export {
  CoverCryptMasterKey,
  type CoverCryptKeyGeneration,
} from "./crypto/abe/core/keygen/cover_crypt"
export { type CoverCryptHybridDecryption } from "./crypto/abe/core/hybrid_crypto/cover_crypt/decryption"
export { type CoverCryptHybridEncryption } from "./crypto/abe/core/hybrid_crypto/cover_crypt/encryption"
export * from "./crypto/abe/core/cover_crypt"
export * from "./crypto/abe/interfaces/encryption_parameters"
export * from "./crypto/abe/interfaces/access_policy"
export * from "./crypto/abe/interfaces/cleartext_header"
export * from "./crypto/abe/interfaces/encrypted_header"
export * from "./crypto/abe/interfaces/policy"
export * from "./crypto/sse/findex/simple"
export * from "./crypto/sse/findex/interfaces/dbInterface"
export * from "./crypto/sse/findex/interfaces/master_keys"
export * from "./crypto/sse/findex/interfaces/index"
export { logger } from "./utils/logger"
export {
  hexDecode,
  hexEncode,
  sanitizeString,
  toBase64,
  deserializeList,
  toBeBytes,
} from "./utils/utils"

export * from "./kms"
export * from "./kms/kmip"
export * from "./kms/requests/Create"
export * from "./kms/requests/CreateKeyPair"
export * from "./kms/requests/Destroy"
export * from "./kms/requests/Get"
export * from "./kms/requests/Import"
export * from "./kms/requests/ReKeyKeyPair"
export * from "./kms/requests/Revoke"
export * from "./kms/responses/GenericKeyPairResponse"
export * from "./kms/responses/GenericUniqueIdentifierResponse"
export * from "./kms/responses/GetResponse"
export * from "./kms/structs/object_attributes"
export * from "./kms/structs/types"
export * from "./kms/structs/object_data_structures"
export * from "./kms/structs/objects"

// @ts-expect-error @ts-ignore-error
setCoverCryptInit(() => cover_crypt_wasm())

// @ts-expect-error @ts-ignore-error
setFindexInit(() => findex_wasm())
