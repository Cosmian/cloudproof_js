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
  VendorAttributes,
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
import { EncryptResponse } from "./responses/EncryptResponse"
import { DecryptResponse } from "./responses/DecryptResponse"
import { capitalize, hexDecode, hexEncode, uncapitalize } from "../utils/utils"
import { Create } from "./requests/Create"

// To serialize/deserialize we need to know at runtime all the KMIP types.
// We save them inside some constants below:

// All the structs we can parse from KMIP.
// During deserialization, we read the KMIP tag and find the matching
// constructor in the list below. Most of the structs have the same name
// than the KMIP tag. Some responses are generic, so they are used for different
// tag.
const STRUCTS = {
  Attributes,
  Link,

  // I'm not sure about that. The documentation specify `VendorAttribute` singular but the receive tag
  // is "VendorAttributes". We should check our Rust implementation of this. :RustImplementation
  VendorAttributes,

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
  DecryptResponse,
  DestroyResponse: GenericUniqueIdentifierResponse,
  EncryptResponse,
  // 'GetAttributesResponse': GenericUniqueIdentifierResponse,
  GetResponse,
  ImportResponse: GenericUniqueIdentifierResponse,
  // 'LocateResponse': GenericUniqueIdentifierResponse,
  ReKeyKeyPairResponse: GenericKeyPairResponse,
  RevokeResponse: GenericUniqueIdentifierResponse,

  Create, // Only useful for testing, we never parse a `Create` request since it's a request
}

// Here are all the enums.
// This list is used to convert an enum value (eg: "3") to the corresponding enum string (eg: "AES") when serializing
// When deserializing, this list is used to convert an enum string (eg: "AES") to the corresponding JS value (eg: "3").
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

// Some enums are enums flags. Their implementation differ because a value doesn't have a mandatory corresponding string.
// For example 12 correspond to CryptographicUsageMask.Encrypt | CryptographicUsageMask.Decrypt (4 + 8).
// These enums are not converted to string during serialization but send as numbers.
const ENUMS_FLAGS = {
  CryptographicUsageMask,
}

/**
 * Deserialize a JSON KMIP struct to JS class
 *
 * @param {string} json JSON string of a KMIP struct
 * @returns a JS object corresponding to the KMIP struct inside the JSON
 */
export function deserialize<T>(json: string): T {
  return fromTTLV<T>(JSON.parse(json))
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

  // String is a JS value, nothing to do.
  if (ttlv.type === TtlvType.TextString) {
    return ttlv.value as T
  }

  // Number is a JS value, nothing to do.
  if (ttlv.type === TtlvType.Integer && typeof ttlv.value === "number") {
    return ttlv.value as T
  }

  // BigInt should be converted from string to `BigInt` class
  if (ttlv.type === TtlvType.BigInteger && typeof ttlv.value === "string") {
    return BigInt(ttlv.value) as T
  }

  // ByteString should be converted from hex string to Uint8Array
  if (ttlv.type === TtlvType.ByteString && typeof ttlv.value === "string") {
    return hexDecode(ttlv.value) as T
  }

  if (ttlv.type === TtlvType.Enumeration) {
    // ObjectType is not an enum in JS but only a string union.
    if (ttlv.tag === "ObjectType") return ttlv.value as T

    // If it's an enum flag, the value should be directly a number (not a string)
    // we can use it as it is in JS.
    if (ttlv.tag in ENUMS_FLAGS && typeof ttlv.value === "number") {
      return ttlv.value as T
    }

    // If we're here, we need to be in the ENUMS list…
    if (!(ttlv.tag in ENUMS)) {
      throw new Error(
        `Cannot understand type Enumeration for tag ${
          ttlv.tag
        } (value is ${ttlv.value.toString()})`,
      )
    }

    // … and the value should be encoded as a string
    if (typeof ttlv.value !== "string") {
      throw new Error(
        `${ttlv.value.toString()} of type Enumeration should be encoded in string`,
      )
    }

    // We can now convert the string to the enum value thanks to the `ENUMS` constant.
    return ENUMS[ttlv.tag as keyof typeof ENUMS][ttlv.value as any] as T
  }

  // Object is a little special since we need to check a sibling ObjectType to know which struct to construct.
  if (
    ttlv.tag === "Object" &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
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

  // KeyMaterial is a little special since we need to check a sibling Attributes.KeyFormatType to know which struct to construct.
  if (
    ttlv.tag === "KeyMaterial" &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
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
      // Now we have the KeyFormatType, we can call `fromTTLV` with the same `ttlv` but overriding the tag
      // with the KeyFormatType value. We'll not go inside the `ttlv.tag === "KeyMaterial"` condition anymore but
      // in the struct parsing below.
      return fromTTLV(ttlv, keyFormatType.value as string)
    }

    throw new Error(
      `Cannot understand the KeyMaterial inside ${JSON.stringify(
        ttlv,
      )} with siblings ${JSON.stringify(siblings)}`,
    )
  }

  // KMIP Structures are mandatory to be JS objects (the value is an array of properties)
  // All JS objects are present in the STRUCTS constant, the tag is associated to a constructor function.
  // Arrays are also `TtlvType.Structure` but cannot arrive in this function. See below :ArrayDetection
  if (
    ttlv.tag in STRUCTS &&
    Array.isArray(ttlv.value) &&
    ttlv.type === TtlvType.Structure
  ) {
    // @ts-expect-error We use the STRUCTS constant to build the object.
    // Some structs have mandatory field in the constructor, they will be `undefined` since we
    // call the constructor with no parameter, bypassing TypeScript.
    const instance = new STRUCTS[ttlv.tag as keyof typeof STRUCTS]()

    // We check all the children of the TTLV structure to set all the properties on the instance.
    // Mandatory properties should be present in the children array.
    // Missing properties should have a default value (not undefined but null or empty arrays) in the JS object.
    // We could do a second pass on all the object properties to see if we miss something (by checking
    // for undefined values)
    for (const child of ttlv.value) {
      // If the tag is "CertificateType", the property name should be `certificateType`.
      const propertyName = uncapitalize(child.tag) as keyof typeof instance

      // If the property is an array (JS properties that expect arrays are defaulting with an empty array)
      if (Array.isArray(instance[propertyName])) {
        // If we require an array the child.value should have an array inside containing all the sub structure
        // We should never call `fromTTLV(child)` in this case. That's why we said "Arrays cannot arrive in this function" above :ArrayDetection
        if (!Array.isArray(child.value)) {
          throw new Error(
            `Property ${
              propertyName as string
            } of ${typeof instance} should be an array but ${JSON.stringify(
              child,
            )} value is not an array.`,
          )
        }

        // @ts-expect-error We'll call fromTTLV for each child.value element and hope they're all of the same type
        // we could do a second pass to check that.
        instance[propertyName] = child.value.map((element) => fromTTLV(element))
      } else {
        // Here the property is not an array, it could be anything.
        // We parse it recursively sending the siblings to help detecting some edge-cases.
        instance[propertyName] = fromTTLV(child, null, ttlv.value)
      }
    }

    return instance as T
  }

  throw new Error(
    `Cannot understand the KMIP struct inside ${JSON.stringify(ttlv, null, 4)}`,
  )
}

/**
 * Serialize JS KMIP struct to a JSON string
 *
 * @param {Serializable} kmip JS KMIP struct
 * @returns {string} JSON string
 */
export function serialize(kmip: Serializable): string {
  return JSON.stringify(toTTLV(kmip))
}

/**
 * Serialize JS KMIP struct to a TTLV object
 * The tag is required for almost all serialization, except for root Serialization
 * which are objects containing a `tag` property (see `Create` for example).
 *
 * @param {Serializable} kmip JS KMIP struct
 * @param {string} tag tag to use
 * @returns {TTLV} TTLV object
 */
export function toTTLV(kmip: Serializable, tag: string | null = null): TTLV {
  // String are serialize to TextString or Enumeration
  // (enumeration should be only for ObjectType because other enums are represented by numbers in JS, we do not
  // check that right now, and if it's an enum represented by a string we serialize the string).
  if (typeof kmip === "string") {
    if (tag === null) {
      throw new Error(`Trying to TTLV '${kmip}' but no tag provided.`)
    }

    const type =
      tag in ENUMS || tag === "ObjectType"
        ? TtlvType.Enumeration
        : TtlvType.TextString

    return { tag, type, value: kmip }
  }

  // Booleans are booleans in KMIP.
  if (typeof kmip === "boolean") {
    if (tag === null)
      throw new Error(
        `Trying to TTLV '${kmip ? "true" : "false"}' but no tag provided.`,
      )
    return { tag, type: TtlvType.Boolean, value: kmip }
  }

  // Numbers can be regular numbers or enumeration.
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

    // We convert the enums values to the corresponding string.
    const value = tag in ENUMS ? ENUMS[tag as keyof typeof ENUMS][kmip] : kmip

    // This should never happen, except if we set a random value not present in the JS enum.
    if (value === undefined) {
      throw new Error(`Value is undefined for enum ${kmip} (enum type ${tag})`)
    }

    return { tag, type, value }
  }

  // BigInt are represented in base 16 with a 0x prefix.
  // It seems that `typeof kmip === "bigint"` is enough for JS to work
  // but TypeScript seems to require `kmip instanceof BigInt` to narrow
  // the type of `kmip` (exclude BigInt). `kmip instanceof BigInt` is not `true`
  // in JS, even with BigInt value.
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

  // Uint8Array are represented hex encoded.
  if (kmip instanceof Uint8Array) {
    if (tag === null)
      throw new Error(
        `Trying to TTLV '${kmip.toString()}' but no tag provided.`,
      )
    return { tag, type: TtlvType.ByteString, value: hexEncode(kmip) }
  }

  // Arrays are Structure in KMIP. We recursively transform each element.
  if (Array.isArray(kmip)) {
    if (tag === null)
      throw new Error(`Trying to TTLV an array but no tag provided.`)
    return {
      tag,
      type: TtlvType.Structure,
      value: kmip.map((element) => toTTLV(element)),
    }
  }

  // Object (KmsObject is JS) is a little bit special because it contains a `type` and a `value`.
  // We need to transform the value (eg: a `OpaqueObject`) but the resulting KMIP will be of tag "OpaqueObject".
  // KMIP spec expect to still be "Object" (and that's why in the deserialization we need to find the correct tag in the siblings)
  if (tag === "Object") {
    const ttlv = toTTLV((kmip as unknown as KmsObject).value)
    ttlv.tag = "Object"
    return ttlv
  }

  // Here we are an object. If we are at the root of the callstack,
  // no `tag` will be define (so we use the tag present inside the object, often it will be
  // a request object, but in tests we sometimes serialize random objects)
  if (tag === null) {
    tag = kmip.tag
    if (tag === undefined) {
      throw new Error(
        `Try to serialize a root JS object ${typeof kmip} but this object doesn't have a tag property. ${JSON.stringify(
          kmip,
        )}`,
      )
    }
  }

  // We check all the object properties, removing:
  // - the special `tag` property
  // - any `null` property
  // - empty arrays
  // Then we serialize the property value and add it to the children array.
  return {
    tag,
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
}

export enum TtlvType {
  Structure = "Structure",
  Integer = "Integer",
  LongInteger = "LongInteger", // We do not support this right now because we don't have test
  BigInteger = "BigInteger",
  Enumeration = "Enumeration",
  Boolean = "Boolean",
  TextString = "TextString",
  ByteString = "ByteString",
  DateTime = "DateTime", // We do not support this right now because we don't have test
  Interval = "Interval", // We do not support this right now because we don't have test
  DateTimeExtended = "DateTimeExtended", // We do not support this right now because we don't have test
}

export type TtlvValue =
  | TTLV[]
  | Date
  | Uint8Array
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

export type Serializable =
  | {
      tag: string
    }
  | string
  | number
  | BigInt
  | Serializable[]
