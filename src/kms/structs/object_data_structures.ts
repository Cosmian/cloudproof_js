/* tslint:disable:max-classes-per-file */
import { Attributes, CryptographicParameters } from "./object_attributes"
import { Policy } from "../../cover_crypt/interfaces/policy"

export enum KeyFormatType {
  Raw = 0x01,
  Opaque = 0x02,
  PKCS1 = 0x03,
  PKCS8 = 0x04,
  X509 = 0x05,
  ECPrivateKey = 0x06,
  TransparentSymmetricKey = 0x07,
  TransparentDSAPrivateKey = 0x08,
  TransparentDSAPublicKey = 0x09,
  TransparentRSAPrivateKey = 0x0a,
  TransparentRSAPublicKey = 0x0b,
  TransparentDHPrivateKey = 0x0c,
  TransparentDHPublicKey = 0x0d,
  TransparentECPrivateKey = 0x14,
  TransparentECPublicKey = 0x15,
  PKCS12 = 0x016,
  PKCS10 = 0x17,
  McfeSecretKey = 0x8880_0001,
  McfeMasterSecretKey = 0x8880_0002,
  McfeFunctionalKey = 0x8880_0003,
  McfeFksSecretKey = 0x8880_0004,
  EnclaveECKeyPair = 0x8880_0005,
  EnclaveECSharedKey = 0x8880_0006,
  TFHE = 0x8880_0007,
  AbeMasterSecretKey = 0x8880_0008,
  AbeMasterPublicKey = 0x8880_0009,
  AbeUserDecryptionKey = 0x8880_000a,
  AbeSymmetricKey = 0x8880_000b,
  CoverCryptSecretKey = 0x8880_000c,
  CoverCryptPublicKey = 0x8880_000d,
}

export enum KeyCompressionType {
  EC_Public_Key_Type_Uncompressed = 0x0000_0001,
  EC_Public_Key_Type_X9_62_Compressed_Prime = 0x0000_0002,
  EC_Public_Key_Type_X9_62_Compressed_Char2 = 0x0000_0003,
  EC_Public_Key_Type_X9_62_Hybrid = 0x0000_0004,
}

export enum CryptographicAlgorithm {
  DES = 0x0000_0001,
  THREEDES = 0x0000_0002,
  AES = 0x0000_0003,
  RSA = 0x0000_0004,
  DSA = 0x0000_0005,
  ECDSA = 0x0000_0006,
  HMACSHA1 = 0x0000_0007,
  HMACSHA224 = 0x0000_0008,
  HMACSHA256 = 0x0000_0009,
  HMACSHA384 = 0x0000_000a,
  HMACSHA512 = 0x0000_000b,
  HMACMD5 = 0x0000_000c,
  DH = 0x0000_000d,
  ECMQV = 0x0000_000f,
  Blowfish = 0x0000_0010,
  Camellia = 0x0000_0011,
  CAST5 = 0x0000_0012,
  IDEA = 0x0000_0013,
  MARS = 0x0000_0014,
  RC2 = 0x0000_0015,
  RC4 = 0x0000_0016,
  RC5 = 0x0000_0017,
  SKIPJACK = 0x0000_0018,
  Twofish = 0x0000_0019,
  EC = 0x0000_001a,
  OneTimePad = 0x0000_001b,
  ChaCha20 = 0x0000_001c,
  Poly1305 = 0x0000_001d,
  ChaCha20Poly1305 = 0x0000_001e,
  SHA3224 = 0x0000_001f,
  SHA3256 = 0x0000_0020,
  SHA3384 = 0x0000_0021,
  SHA3512 = 0x0000_0022,
  HMACSHA3224 = 0x0000_0023,
  HMACSHA3256 = 0x0000_0024,
  HMACSHA3384 = 0x0000_0025,
  HMACSHA3512 = 0x0000_0026,
  SHAKE128 = 0x0000_0027,
  SHAKE256 = 0x0000_0028,
  ARIA = 0x0000_0029,
  SEED = 0x0000_002a,
  SM2 = 0x0000_002b,
  SM3 = 0x0000_002c,
  SM4 = 0x0000_002d,
  GOSTR34102012 = 0x0000_002e,
  GOSTR34112012 = 0x0000_002f,
  GOSTR34132015 = 0x0000_0030,
  GOST2814789 = 0x0000_0031,
  XMSS = 0x0000_0032,
  SPHINCS256 = 0x0000_0033,
  Page166of230McEliece = 0x0000_0034,
  McEliece6960119 = 0x0000_0035,
  McEliece8192128 = 0x0000_0036,
  Ed25519 = 0x0000_0037,
  Ed448 = 0x0000_0038,
  LWE = 0x8880_0001,
  TFHE = 0x8880_0002,
  ABE = 0x8880_0003,
  CoverCrypt = 0x8880_0004,
  FPEFF1 = 0x8880_0005,
}

export class KeyBlock {
  keyFormatType: KeyFormatType
  keyValue: Uint8Array | KeyValue | null = null
  cryptographicAlgorithm: CryptographicAlgorithm
  cryptographicLength: number
  keyCompressionType: KeyCompressionType | null = null
  keyWrappingData: KeyWrappingData | null = null

  constructor(
    keyFormatType: KeyFormatType,
    keyValue: Uint8Array | KeyValue | null = null,
    cryptographicAlgorithm: CryptographicAlgorithm,
    cryptographicLength: number,
    keyCompressionType: KeyCompressionType | null = null,
    keyWrappingData: KeyWrappingData | null = null,
  ) {
    this.keyFormatType = keyFormatType
    this.keyValue = keyValue
    this.keyCompressionType = keyCompressionType
    this.cryptographicAlgorithm = cryptographicAlgorithm
    this.cryptographicLength = cryptographicLength
    this.keyWrappingData = keyWrappingData
  }

  public bytes(): Uint8Array {
    if (this.keyValue instanceof Uint8Array) {
      return this.keyValue
    }

    if (this.keyValue === null) {
      throw new Error("No key bytes found")
    }

    if (this.keyValue.keyMaterial instanceof Uint8Array) {
      return this.keyValue.keyMaterial
    }

    if (this.keyValue.keyMaterial instanceof TransparentSymmetricKey) {
      return this.keyValue.keyMaterial.key
    }

    throw new Error(
      `Cannot extract bytes from key of type ${typeof this.keyValue
        .keyMaterial}`,
    )
  }

  public policy(): Policy {
    if (this.keyValue === null) {
      throw new Error("Cannot get policy from a key with no key value.")
    }

    if (this.keyValue instanceof Uint8Array) {
      throw new Error(
        "Cannot get policy from a key represented by only raw bytes.",
      )
    }

    if (this.keyValue.attributes === null) {
      throw new Error("Cannot get policy from a key with no attributes.")
    }

    return Policy.fromAttributes(this.keyValue.attributes)
  }
}

export class KeyValue {
  keyMaterial: Uint8Array | KeyMaterial
  attributes: Attributes | null = null

  constructor(
    keyMaterial: Uint8Array | KeyMaterial,
    attributes: Attributes | null = null,
  ) {
    this.keyMaterial = keyMaterial
    this.attributes = attributes
  }
}

export enum WrappingMethod {
  Encrypt = 0x0000_0001,
  MAC_sign = 0x0000_0002,
  Encrypt_then_MAC_sign = 0x0000_0003,
  MAC_sign_then_encrypt = 0x0000_0004,
  TR_31 = 0x0000_0005,
}

export enum EncodingOption {
  /// the Key Value structure
  No_Encoding = 0x0000_0001,
  /// the wrapped TTLV-encoded Key Value structure
  TTLV_Encoding = 0x0000_0002,
}

export class KeyWrappingData {
  wrappingMethod: WrappingMethod
  encryptionKeyInformation: EncryptionKeyInformation | null = null
  macOrSignatureKeyInformation: MacOrSignatureKeyInformation | null = null
  macOrSignature: Uint8Array | null = null
  ivCounterNonce: Uint8Array | null = null
  encodingOption: EncodingOption | null = null

  constructor(
    wrappingMethod: WrappingMethod,
    encryptionKeyInformation: EncryptionKeyInformation | null = null,
    macOrSignatureKeyInformation: MacOrSignatureKeyInformation | null = null,
    macOrSignature: Uint8Array | null = null,
    ivCounterNonce: Uint8Array | null = null,
    encodingOption: EncodingOption | null = null,
  ) {
    this.wrappingMethod = wrappingMethod
    this.encryptionKeyInformation = encryptionKeyInformation
    this.macOrSignatureKeyInformation = macOrSignatureKeyInformation
    this.macOrSignature = macOrSignature
    this.ivCounterNonce = ivCounterNonce
    this.encodingOption = encodingOption
  }
}

export class EncryptionKeyInformation {
  uniqueIdentifier: string
  cryptographicParameters: CryptographicParameters | null = null

  constructor(
    uniqueIdentifier: string,
    cryptographicParameters: CryptographicParameters | null = null,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.cryptographicParameters = cryptographicParameters
  }
}

export class MacOrSignatureKeyInformation {
  uniqueIdentifier: string
  cryptographicParameters: CryptographicParameters | null = null

  constructor(
    uniqueIdentifier: string,
    cryptographicParameters: CryptographicParameters | null = null,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.cryptographicParameters = cryptographicParameters
  }
}

export type KeyMaterial =
  | TransparentSymmetricKey
  | TransparentDHPrivateKey
  | TransparentDHPublicKey
  | TransparentECPrivateKey
  | TransparentECPublicKey

export class TransparentSymmetricKey {
  key: Uint8Array

  constructor(key: Uint8Array) {
    this.key = key
  }
}

export class TransparentDHPrivateKey {
  p: BigInt
  q: BigInt | null = null
  g: BigInt
  j: BigInt | null = null
  x: BigInt

  constructor(
    p: BigInt,
    q: BigInt | null = null,
    g: BigInt,
    j: BigInt | null = null,
    x: BigInt,
  ) {
    this.p = p
    this.q = q
    this.g = g
    this.j = j
    this.x = x
  }
}

export class TransparentDHPublicKey {
  p: BigInt
  q: BigInt | null = null
  g: BigInt
  j: BigInt | null = null
  y: BigInt

  constructor(
    p: BigInt,
    q: BigInt | null = null,
    g: BigInt,
    j: BigInt | null = null,
    y: BigInt,
  ) {
    this.p = p
    this.q = q
    this.g = g
    this.j = j
    this.y = y
  }
}

export enum RecommendedCurve {
  P_192 = 0x0000_0001,
  K_163 = 0x0000_0002,
  B_163 = 0x0000_0003,
  P_224 = 0x0000_0004,
  K_233 = 0x0000_0005,
  B_233 = 0x0000_0006,
  P_256 = 0x0000_0007,
  K_283 = 0x0000_0008,
  B_283 = 0x0000_0009,
  P_384 = 0x0000_000a,
  K_409 = 0x0000_000b,
  B_409 = 0x0000_000c,
  P_521 = 0x0000_000d,
  K_571 = 0x0000_000e,
  B_571 = 0x0000_000f,
  SECP112R1 = 0x0000_0010,
  SECP112R2 = 0x0000_0011,
  SECP128R1 = 0x0000_0012,
  SECP128R2 = 0x0000_0013,
  SECP160K1 = 0x0000_0014,
  SECP160R1 = 0x0000_0015,
  SECP160R2 = 0x0000_0016,
  SECP192K1 = 0x0000_0017,
  SECP224K1 = 0x0000_0018,
  SECP256K1 = 0x0000_0019,
  SECT113R1 = 0x0000_001a,
  SECT131R1 = 0x0000_001c,
  SECT131R2 = 0x0000_001d,
  SECT163R1 = 0x0000_001e,
  SECT193R1 = 0x0000_001f,
  SECT193R2 = 0x0000_0020,
  SECT239K1 = 0x0000_0021,
  ANSIX9P192V2 = 0x0000_0022,
  ANSIX9P192V3 = 0x0000_0023,
  ANSIX9P239V1 = 0x0000_0024,
  ANSIX9P239V2 = 0x0000_0025,
  ANSIX9P239V3 = 0x0000_0026,
  ANSIX9C2PNB163V1 = 0x0000_0027,
  ANSIX9C2PNB163V2 = 0x0000_0028,
  ANSIX9C2PNB163V3 = 0x0000_0029,
  ANSIX9C2PNB176V1 = 0x0000_002a,
  ANSIX9C2TNB191V1 = 0x0000_002b,
  ANSIX9C2TNB191V2 = 0x0000_002c,
  ANSIX9C2TNB191V3 = 0x0000_002d,
  ANSIX9C2PNB208W1 = 0x0000_002e,
  ANSIX9C2TNB239V1 = 0x0000_002f,
  ANSIX9C2TNB239V2 = 0x0000_0030,
  ANSIX9C2TNB239V3 = 0x0000_0031,
  ANSIX9C2PNB272W1 = 0x0000_0032,
  ANSIX9C2PNB304W1 = 0x0000_0033,
  ANSIX9C2TNB359V1 = 0x0000_0034,
  ANSIX9C2PNB368W1 = 0x0000_0035,
  ANSIX9C2TNB431R1 = 0x0000_0036,
  BRAINPOOLP160R1 = 0x0000_0037,
  BRAINPOOLP160T1 = 0x0000_0038,
  BRAINPOOLP192R1 = 0x0000_0039,
  BRAINPOOLP192T1 = 0x0000_003a,
  BRAINPOOLP224R1 = 0x0000_003b,
  BRAINPOOLP224T1 = 0x0000_003c,
  BRAINPOOLP256R1 = 0x0000_003d,
  BRAINPOOLP256T1 = 0x0000_003e,
  BRAINPOOLP320R1 = 0x0000_003f,
  BRAINPOOLP320T1 = 0x0000_0040,
  BRAINPOOLP384T1 = 0x0000_0042,
  BRAINPOOLP512R1 = 0x0000_0043,
  BRAINPOOLP512T1 = 0x0000_0044,
  CURVE25519 = 0x0000_0045,
  CURVE448 = 0x0000_0046,
  // Extensions 8XXXXXXX
}

export class TransparentECPrivateKey {
  tag = "TransparentECPrivateKey"

  recommendedCurve: RecommendedCurve
  d: BigInt

  constructor(recommendedCurve: RecommendedCurve, d: BigInt) {
    this.recommendedCurve = recommendedCurve
    this.d = d
  }
}

export class TransparentECPublicKey {
  tag = "TransparentECPublicKey"

  recommendedCurve: RecommendedCurve
  q: BigInt

  constructor(recommendedCurve: RecommendedCurve, q: BigInt) {
    this.recommendedCurve = recommendedCurve
    this.q = q
  }
}
