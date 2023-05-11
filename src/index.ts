import cover_crypt_wasm from "./pkg/cover_crypt/cloudproof_cover_crypt_bg.wasm"
import { setCoverCryptInit } from "./cover_crypt/cover_crypt"

import findex_wasm from "./pkg/findex/cloudproof_findex_bg.wasm"
import { setFindexInit } from "./findex/findex"

import fpe_wasm from "./pkg/fpe/cloudproof_fpe_bg.wasm"
import { setFpeInit } from "./fpe/fpe"

// @ts-expect-error @ts-ignore-error
setCoverCryptInit(() => cover_crypt_wasm())

// @ts-expect-error @ts-ignore-error
setFindexInit(() => findex_wasm())

// @ts-expect-error @ts-ignore-error
setFpeInit(() => fpe_wasm())

export * from "all_exports"
