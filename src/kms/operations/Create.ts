import { metadata } from "../decorators/function"
import { Deserialize } from "../deserialize/Deserialize"
import { defaultStructureParser } from "../deserialize/deserializer"
import { KmipStruct } from "../json/KmipStruct"
import { TTLV } from "../serialize/Ttlv"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"
import { ObjectType } from "../types/ObjectType"

/**
 * This operation requests the server to generate a new symmetric key or
 * generate Secret Data as a Managed Cryptographic Object. The request contains
 * information about the type of object being created, and some of the
 * attributes to be assigned to the object (e.g., Cryptographic Algorithm,
 * Cryptographic Length, etc.). The response contains the Unique Identifier of
 * the created object. The server SHALL copy the Unique Identifier returned by
 * this operation into the ID Placeholder variable.
 */
export class Create implements KmipStruct, Deserialize {
  tag = "Create";

  @metadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectType,
  })
  /// Determines the type of object to be created.
  private _objectType: ObjectType

  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
    classOrEnum: Attributes,
    // need to postfix the Object Type of the attributes
    // fromTtlv: FromTTLVClass.structure(Attributes, ObjectType.Certificate),
  })
  /// Specifies desired attributes to be associated with the new object.
  private _attributes: Attributes

  @metadata({
    name: "ProtectionStorageMasks",
    type: TtlvType.Integer,
  })
  /// Specifies all permissible Protection Storage Mask selections for the new
  /// object
  /// @see ProtectionStorageMasks
  private _protectionStorageMasks?: number

  constructor(
    objectType: ObjectType,
    attributes: Attributes,
    protectionStorageMasks?: number,
  )
  constructor(
    objectType?: ObjectType,
    attributes?: Attributes,
    protectionStorageMasks?: number,
  ) {
    this._objectType = objectType ?? ObjectType.SymmetricKey
    this._attributes = attributes ?? new Attributes(ObjectType.SymmetricKey)
    this._protectionStorageMasks = protectionStorageMasks
  }

  public get objectType(): ObjectType {
    return this._objectType
  }

  public set objectType(value: ObjectType) {
    this._objectType = value
  }

  public get attributes(): Attributes {
    return this._attributes
  }

  public set attributes(value: Attributes) {
    this._attributes = value
  }

  public get protectionStorageMasks(): number | undefined {
    return this._protectionStorageMasks
  }

  public set protectionStorageMasks(value: number | undefined) {
    this._protectionStorageMasks = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Create)) {
      return false
    }
    const create = o
    return (
      this._objectType === create.objectType &&
      this._attributes === create.attributes &&
      this._protectionStorageMasks === create.protectionStorageMasks
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }

  public fromTTLV(ttlv: TTLV, propertyName?: string | undefined): this {
    defaultStructureParser(this, ttlv, propertyName ?? "ROOT")
    this._attributes.objectType = this._objectType
    return this
  }
}
