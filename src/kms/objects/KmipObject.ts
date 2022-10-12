import { Certificate } from "crypto"
import { CertificateRequest } from "./CertificateRequest"
import { OpaqueObject } from "./OpaqueObject"
import { PGPKey } from "./PGPKey"
import { PrivateKey } from "./PrivateKey"
import { PublicKey } from "./PublicKey"
import { SecretData } from "./SecretData"
import { SplitKey } from "./SplitKey"
import { SymmetricKey } from "./SymmetricKey"

export type KmipObject = Certificate | CertificateRequest | OpaqueObject | PGPKey | PrivateKey | PublicKey | SecretData | SplitKey | SymmetricKey
