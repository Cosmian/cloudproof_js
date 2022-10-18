import { ObjectType } from "../types/ObjectType"
import { Certificate } from "./Certificate"
import { CertificateRequest } from "./CertificateRequest"
import { OpaqueObject } from "./OpaqueObject"
import { PGPKey } from "./PGPKey"
import { PrivateKey } from "./PrivateKey"
import { PublicKey } from "./PublicKey"
import { SecretData } from "./SecretData"
import { SplitKey } from "./SplitKey"
import { SymmetricKey } from "./SymmetricKey"

export type KmipObject =
  | Certificate
  | CertificateRequest
  | OpaqueObject
  | PGPKey
  | PrivateKey
  | PublicKey
  | SecretData
  | SplitKey
  | SymmetricKey

/**
 * Determine the ObjectType from the KMIP Object instance
 *
 * @param {KmipObject} object the instance
 * @returns {ObjectType} the type
 */
export function getObjectType(object: KmipObject): ObjectType {
  if (object instanceof Certificate) {
    return ObjectType.Certificate
  }
  if (object instanceof CertificateRequest) {
    return ObjectType.CertificateRequest
  }
  if (object instanceof OpaqueObject) {
    return ObjectType.OpaqueObject
  }
  if (object instanceof PGPKey) {
    return ObjectType.PGPKey
  }
  if (object instanceof PrivateKey) {
    return ObjectType.PrivateKey
  }
  if (object instanceof PublicKey) {
    return ObjectType.PublicKey
  }
  if (object instanceof SecretData) {
    return ObjectType.SecretData
  }
  if (object instanceof SplitKey) {
    return ObjectType.SplitKey
  }
  if (object instanceof SymmetricKey) {
    return ObjectType.SymmetricKey
  }
  throw new Error(`Unknown Object type ${typeof object}`)
}
