import { KeyBlock } from "./object_data_structures"

export type ObjectType =
    'Certificate'
    | 'SymmetricKey'
    | 'PublicKey'
    | 'PrivateKey'
    | 'SplitKey'
    | 'SecretData'
    | 'OpaqueObject'
    | 'PGPKey'
    | 'CertificateRequest'

export type KmsObject =
    { type: "Certificate", value: Certificate }
    | { type: "CertificateRequest", value: CertificateRequest }
    | { type: "OpaqueObject", value: OpaqueObject }
    | { type: "PGPKey", value: PGPKey }
    | { type: "PrivateKey", value: PrivateKey }
    | { type: "PublicKey", value: PublicKey }
    | { type: "SecretData", value: SecretData }
    | { type: "SplitKey", value: SplitKey }
    | { type: "SymmetricKey", value: SymmetricKey }

export enum CertificateType {
    X509 = 0x01,
    PGP = 0x02,
}

export class Certificate {
    tag = "Certificate"

    certificateType: CertificateType
    certificateValue: Uint8Array

    constructor(certificateType: CertificateType, certificateValue: Uint8Array) {
        this.certificateType = certificateType
        this.certificateValue = certificateValue
    }
}

export enum CertificateRequestType {
    CRMF = 0x01,
    PKCS10 = 0x02,
    PEM = 0x03,
}  

export class CertificateRequest {
    tag = "CertificateRequest"
    
    certificateRequestType: CertificateRequestType
    certificateRequestValue: Uint8Array

    constructor(certificateRequestType: CertificateRequestType, certificateRequestValue: Uint8Array) {
        this.certificateRequestType = certificateRequestType
        this.certificateRequestValue = certificateRequestValue
    }
}

export enum OpaqueDataType {
    Unknown = 0x8000_0001,
}
  
export class OpaqueObject {
    tag = "OpaqueObject"

    opaqueDataType: OpaqueDataType
    opaqueDataValue: Uint8Array

    constructor(opaqueDataType: OpaqueDataType, opaqueDataValue: Uint8Array) {
        this.opaqueDataType = opaqueDataType
        this.opaqueDataValue = opaqueDataValue
    }
}
  
export class PGPKey {
    tag = "PGPKey"

    pgpKeyVersion: number
    keyBlock: KeyBlock

    constructor(pgpKeyVersion: number, keyBlock: KeyBlock) {
        this.pgpKeyVersion = pgpKeyVersion
        this.keyBlock = keyBlock
    }
}
  
export class PrivateKey {
    tag = "PrivateKey"

    keyBlock: KeyBlock

    constructor(keyBlock: KeyBlock) {
        this.keyBlock = keyBlock
    }

    bytes(): Uint8Array {
        return this.keyBlock.bytes()
    }
}
  
export class PublicKey {
    tag = "PublicKey"

    keyBlock: KeyBlock

    constructor(keyBlock: KeyBlock) {
        this.keyBlock = keyBlock
    }

    bytes(): Uint8Array {
        return this.keyBlock.bytes()
    }
}

export enum SecretDataType {
    Password = 0x01,
    Seed = 0x02,
    FunctionalKey = 0x8000_0001,
    FunctionalKeyShare = 0x8000_0002,
}
  
export class SecretData {
    tag = "SecretData"

    secretDataType: SecretDataType
    keyBlock: KeyBlock

    constructor(secretDataType: SecretDataType, keyBlock: KeyBlock) {
        this.secretDataType = secretDataType
        this.keyBlock = keyBlock
    }
}
  
export enum SplitKeyMethod {
    XOR = 0x00000001,
    PolynomialSharingGf2_16 = 0x0000_0002,
    PolynomialSharingPrimeField = 0x0000_0003,
    PolynomialSharingGf2_8 = 0x0000_0004,
}  

export class SplitKey {
    tag = "SplitKey"

    splitKeyParts: number
    keyPartIdentifier: number
    splitKeyThreshold: number
    splitKeyMethod: SplitKeyMethod
    keyBlock: KeyBlock
    primeFieldSize: BigInt | null = null

    constructor(
        splitKeyParts: number,
        keyPartIdentifier: number,
        splitKeyThreshold: number,
        splitKeyMethod: SplitKeyMethod,
        keyBlock: KeyBlock,
        primeFieldSize: BigInt | null = null,
    ) {
        this.splitKeyParts = splitKeyParts
        this.keyPartIdentifier = keyPartIdentifier
        this.splitKeyThreshold = splitKeyThreshold
        this.splitKeyMethod = splitKeyMethod
        this.keyBlock = keyBlock
        this.primeFieldSize = primeFieldSize
    }
}

export class SymmetricKey {
    tag = "SymmetricKey"

    keyBlock: KeyBlock

    constructor(keyBlock: KeyBlock) {
        this.keyBlock = keyBlock
    }

    public bytes(): Uint8Array {
        return this.keyBlock.bytes();
    }
}
