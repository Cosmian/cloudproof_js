import {
  KeyBlock,
  KeyValue,
  KeyWrappingData,
  EncryptionKeyInformation,
  MacOrSignatureKeyInformation,
  TransparentSymmetricKey,
  TransparentDHPrivateKey,
  TransparentDHPublicKey,
  TransparentECPrivateKey,
  TransparentECPublicKey,
  KeyFormatType,
  KeyCompressionType,
  CryptographicAlgorithm,
  WrappingMethod,
  EncodingOption,
  RecommendedCurve,
} from "./structs/object_data_structures"
import {
  Attributes,
  Link,
  VendorAttribute,
  CryptographicDomainParameters,
  CryptographicParameters,
  LinkType,
  LinkedUniqueIdentifier,
  BlockCipherMode,
  PaddingMethod,
  HashingAlgorithm,
  KeyRoleType,
  DigitalSignatureAlgorithm,
  MaskGenerator,
} from "./structs/object_attributes"
import {
  KmsObject,
  Certificate,
  CertificateRequest,
  OpaqueObject,
  PGPKey,
  PrivateKey,
  PublicKey,
  SecretData,
  SplitKey,
  SymmetricKey,
  CertificateType,
  CertificateRequestType,
  OpaqueDataType,
  SecretDataType,
  SplitKeyMethod,
} from "./structs/objects"
import {
  KeyWrapType,
  RevocationReasonEnumeration,
  CryptographicUsageMask,
} from "./structs/types"
import { GenericKeyPairResponse } from "./responses/GenericKeyPairResponse"
import { GenericUniqueIdentifierResponse } from "./responses/GenericUniqueIdentifierResponse"
import { GetResponse } from "./responses/GetResponse"
import { hexDecode, hexEncode } from "../utils/utils"

/**
 * Deserialize a JSON KMIP struct to JS class
 *
 * @param {string} json JSON string of a KMIP struct
 * @returns a JS object corresponding to the KMIP struct inside the JSON
 */
export function deserialize<T>(json: string): T {
  const result = fromTTLV<T>(JSON.parse(json))
  // console.log(JSON.stringify(JSON.parse(json), null, 4));
  return result
}
/**
 * Deserialize a JSON KMIP struct to JS class
 *
 * @param {TTLV} ttlv ttlv string of a KMIP struct
 * @param tag override the TTLV tag with this one if defined. (used for some objects that require parent knowledge to know their types)
 * @param siblings list of TTLV at the same level of the current one (used for some objects that require a sibling to know their types)
 * @returns a JS object corresponding to the KMIP struct inside the TTLV
 */
export function fromTTLV<T>(
  ttlv: TTLV,
  tag: string | null = null,
  siblings: TTLV[] = [],
): T {
  if (tag !== null) ttlv.tag = tag

  if (ttlv.type === TtlvType.Enumeration) {
    if (ttlv.tag === "ObjectType") return ttlv.value as T

    if (!(ttlv.tag in ENUMS)) {
      throw new Error(`Cannot understand type Enumeration for tag ${ttlv.tag}`)
    }

    if (typeof ttlv.value !== "string") {
      throw new Error(
        `${ttlv.value.toString()} of type Enumeration should be encoded in string`,
      )
    }

    return ENUMS[ttlv.tag as keyof typeof ENUMS][ttlv.value as any] as T
  }

  if (ttlv.type === TtlvType.TextString) {
    return ttlv.value as T
  }

  if (ttlv.type === TtlvType.ByteString && typeof ttlv.value === "string") {
    return hexDecode(ttlv.value) as T
  }

  if (ttlv.type === TtlvType.Integer && typeof ttlv.value === "number") {
    return ttlv.value as T
  }

  if (ttlv.type === TtlvType.BigInteger && typeof ttlv.value === "string") {
    return BigInt(ttlv.value) as T
  }

  if (
    ttlv.tag === "Object" &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
    // Object is a little special since we need to check a sibling ObjectType to know which struct to construct.

    if (siblings.length === 0) {
      throw new Error(
        "To parse an Object, we need to have access to the list of siblings.",
      )
    }

    const objectType = siblings.find((element) => element.tag === "ObjectType")
    if (objectType === undefined) {
      throw new Error(
        "To parse an Object, we need to have an ObjectType in the siblings",
      )
    }

    const result = {
      type: objectType.value,
      value: fromTTLV(ttlv, objectType.value as string),
    }
    return result as T
  }

  if (
    ttlv.tag === "KeyMaterial" &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
    // KeyMaterial is a little special since we need to check a sibling ObjectType to know which struct to construct.

    if (siblings.length === 0) {
      throw new Error(
        "To parse a KeyMaterial, we need to have access to the list of siblings.",
      )
    }

    const attributes = siblings.find((element) => element.tag === "Attributes")
    if (attributes === undefined) {
      throw new Error(
        "To parse a KeyMaterial, we need to have an Attributes in the siblings",
      )
    }

    if (!Array.isArray(attributes.value) || attributes.type !== "Structure") {
      throw new Error(
        "During parse of a KeyMaterial, the Attributes in the siblings should be a structure",
      )
    }

    const keyFormatType = attributes.value.find(
      (element) => element.tag === "KeyFormatType",
    )
    if (keyFormatType === undefined) {
      throw new Error(
        "To parse a KeyMaterial, we need to have a KeyFormatType in the Attributes in the siblings",
      )
    }

    if (
      [
        "TransparentSymmetricKey",
        "TransparentDHPrivateKey",
        "TransparentDHPublicKey",
        "TransparentECPrivateKey",
        "TransparentECPublicKey",
      ].includes(keyFormatType.value as string)
    ) {
      return fromTTLV(ttlv, keyFormatType.value as string)
    }

    throw new Error(
      `Cannot understand the KeyMaterial inside ${JSON.stringify(
        ttlv,
      )} with siblings ${JSON.stringify(siblings)}`,
    )
  }

  if (
    ttlv.tag in STRUCTS &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
    // @ts-expect-error
    const instance = new STRUCTS[ttlv.tag as keyof typeof STRUCTS]()

    for (const child of ttlv.value) {
      const propertyName = uncapitalize(child.tag) as keyof typeof instance
      if (Array.isArray(instance[propertyName])) {
        if (!Array.isArray(child.value)) {
          throw new Error(
            `Property ${
              propertyName as string
            } of ${typeof instance} should be an array but ${JSON.stringify(
              child,
            )} value is not an array.`,
          )
        }

        // @ts-expect-error
        instance[propertyName] = child.value.map((element) => fromTTLV(element))
      } else {
        instance[propertyName] = fromTTLV(child, null, ttlv.value)
      }
    }

    return instance as T
  }

  throw new Error(
    `Cannot understand the KMIP struct inside ${JSON.stringify(ttlv, null, 4)}`,
  )
}

export type Serializable =
  | {
      tag: string
    }
  | string
  | number
  | BigInt
  | Serializable[]

/**
 * Seriazile JS KMIP struct to a JSON string
 *
 * @param {Serializable} kmip JS KMIP struct
 * @returns {string} JSON string
 */
export function serialize(kmip: Serializable): string {
  return JSON.stringify(toTTLV(kmip))
}

const STRUCTS = {
  Attributes,
  Link,
  VendorAttribute,
  VendorAttributes: VendorAttribute,
  CryptographicDomainParameters,
  CryptographicParameters,

  KeyBlock,
  KeyValue,
  KeyWrappingData,
  EncryptionKeyInformation,
  MacOrSignatureKeyInformation,
  TransparentSymmetricKey,
  TransparentDHPrivateKey,
  TransparentDHPublicKey,
  TransparentECPrivateKey,
  TransparentECPublicKey,

  Certificate,
  CertificateRequest,
  OpaqueObject,
  PGPKey,
  PrivateKey,
  PublicKey,
  SecretData,
  SplitKey,
  SymmetricKey,

  CreateKeyPairResponse: GenericKeyPairResponse,
  CreateResponse: GenericUniqueIdentifierResponse,
  // 'DecryptResponse': GenericUniqueIdentifierResponse,
  DestroyResponse: GenericUniqueIdentifierResponse,
  // 'EncryptResponse': GenericUniqueIdentifierResponse,
  // 'GetAttributesResponse': GenericUniqueIdentifierResponse,
  GetResponse,
  ImportResponse: GenericUniqueIdentifierResponse,
  // 'LocateResponse': GenericUniqueIdentifierResponse,
  ReKeyKeyPairResponse: GenericKeyPairResponse,
  RevokeResponse: GenericUniqueIdentifierResponse,
}

const ENUMS = {
  LinkType,
  LinkedUniqueIdentifier,
  BlockCipherMode,
  PaddingMethod,
  HashingAlgorithm,
  KeyRoleType,
  DigitalSignatureAlgorithm,
  MaskGenerator,

  KeyFormatType,
  KeyCompressionType,
  CryptographicAlgorithm,
  WrappingMethod,
  EncodingOption,
  RecommendedCurve,

  CertificateType,
  CertificateRequestType,
  OpaqueDataType,
  SecretDataType,
  SplitKeyMethod,

  KeyWrapType,
  RevocationReasonEnumeration,
}

const ENUMS_FLAGS = {
  CryptographicUsageMask,
}

/**
 * Seriazile JS KMIP struct to a TTLV object
 *
 * @param {Serializable} kmip JS KMIP struct
 * @param {string} tag tag to use
 * @returns {TTLV} TTLV object
 */
export function toTTLV(
  kmip: Serializable | string,
  tag: string | null = null,
): TTLV {
  if (typeof kmip === "string") {
    if (tag === null)
      throw new Error(`Trying to TTLV '${kmip}' but no tag provided.`)

    const type =
      tag in ENUMS || tag === "ObjectType"
        ? TtlvType.Enumeration
        : TtlvType.TextString
    return { tag, type, value: kmip }
  }

  if (typeof kmip === "boolean") {
    if (tag === null)
      throw new Error(
        `Trying to TTLV '${kmip ? "true" : "false"}' but no tag provided.`,
      )
    return { tag, type: TtlvType.Boolean, value: kmip }
  }

  if (typeof kmip === "number") {
    if (tag === null)
      throw new Error(`Trying to TTLV '${kmip}' but no tag provided.`)

    const type =
      tag in ENUMS || tag in ENUMS_FLAGS
        ? TtlvType.Enumeration
        : TtlvType.Integer

    // If the enum is a flag, we cannot transform it to string
    // because all the possible values doesn't exists as a string format.
    if (tag in ENUMS_FLAGS) {
      return { tag, type, value: kmip }
    }

    const value = tag in ENUMS ? ENUMS[tag as keyof typeof ENUMS][kmip] : kmip
    if (value === undefined)
      throw new Error(`Value is undefined for enum ${kmip} (enum type ${tag})`)
    return { tag, type, value }
  }

  if (typeof kmip === "bigint" || kmip instanceof BigInt) {
    if (tag === null)
      throw new Error(
        `Trying to TTLV '${kmip.toString()}' but no tag provided.`,
      )
    return {
      tag,
      type: TtlvType.BigInteger,
      value: `0x${kmip.toString(16).toUpperCase()}`,
    }
  }

  if (kmip instanceof Uint8Array) {
    if (tag === null)
      throw new Error(
        `Trying to TTLV '${kmip.toString()}' but no tag provided.`,
      )
    return { tag, type: TtlvType.ByteString, value: hexEncode(kmip) }
  }

  if (Array.isArray(kmip)) {
    if (tag === null)
      throw new Error(`Trying to TTLV an array but no tag provided.`)
    return {
      tag,
      type: TtlvType.Structure,
      value: kmip.map((element) => toTTLV(element)),
    }
  }

  if (tag === "Object") {
    const ttlv = toTTLV((kmip as unknown as KmsObject).value)
    ttlv.tag = "Object"
    return ttlv
  }

  const ttlv = {
    tag: tag !== null ? tag : kmip.tag,
    type: TtlvType.Structure,
    value: Object.entries(kmip)
      .filter(([propertyName]) => !["tag"].includes(propertyName))
      .filter(
        ([, propertyValue]) =>
          propertyValue !== null &&
          (!Array.isArray(propertyValue) || propertyValue.length),
      )
      .map(([propertyName, propertyValue]) => {
        return toTTLV(propertyValue, capitalize(propertyName))
      }),
  }

  // console.log(JSON.stringify(ttlv, null, 4))

  return ttlv
}

export enum TtlvType {
  Structure = "Structure",

  /**
   * An array of Structures
   * Does not exist as original TTLV
   * Added to support array deserialization
   */
  StructuresArray = "StructuresArray",

  Integer = "Integer",
  LongInteger = "LongInteger",
  BigInteger = "BigInteger",
  Enumeration = "Enumeration",
  Boolean = "Boolean",
  TextString = "TextString",
  ByteString = "ByteString",
  DateTime = "DateTime",
  Interval = "Interval",
  DateTimeExtended = "DateTimeExtended",

  // a type added to support polymorphism
  // where a TTLV value can take a list of multiple types
  Choice = "Choice",

  // The property should be ignored on serialization/deserialization
  Ignore = "Ignore",
}

export type LongInt = BigInt

export type TtlvValue =
  | TTLV[]
  | Date
  | Uint8Array
  | LongInt
  //   | Interval
  //   | DateTimeExtended
  | number
  | BigInt
  | boolean
  | string

export interface TTLV {
  tag: string
  type: TtlvType
  value: TtlvValue
}

/**
 * Lowercase the first letter of a string
 *
 * @param value the string
 * @returns the string with the first letter lowercased
 */
function uncapitalize(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

/**
 * Uppercase the first letter of a string
 *
 * @param value the string
 * @returns the string with the first letter uppercased
 */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
