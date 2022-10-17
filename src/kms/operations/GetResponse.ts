import { Certificate } from "kms/objects/Certificate"
import { Deserialize } from "kms/deserialize/Deserialize"
import { defaultStructureParser } from "kms/deserialize/deserializer"
import { CertificateRequest } from "kms/objects/CertificateRequest"
import { OpaqueObject } from "kms/objects/OpaqueObject"
import { PGPKey } from "kms/objects/PGPKey"
import { PrivateKey } from "kms/objects/PrivateKey"
import { PublicKey } from "kms/objects/PublicKey"
import { SecretData } from "kms/objects/SecretData"
import { SplitKey } from "kms/objects/SplitKey"
import { SymmetricKey } from "kms/objects/SymmetricKey"
import { TTLV } from "kms/serialize/Ttlv"
import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { KmipObject } from "../objects/KmipObject"
import { TtlvType } from "../serialize/TtlvType"
import { ObjectType } from "../types/ObjectType"

export class GetResponse implements KmipStruct, Deserialize {
  // Determines the type of object being retrieved.
  @metadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectType,
  })
  private _objectType: ObjectType

  // The Unique Identifier of the object to be retrieved
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  // The object being retrieved.
  @metadata({
    name: "Object",
    type: TtlvType.Structure,
    fromTtlv: (propertyName: string, ttlv: TTLV): Object => {
      // this indicates that deserialization is post-processed in fromTtlv() below
      // The _object property will hold a TTLV until the post process
      return ttlv
    },
  })
  private _object: KmipObject | TTLV

  constructor(
    objectType: ObjectType,
    uniqueIdentifier: string,
    object: KmipObject
  ) {
    this._objectType = objectType
    this._uniqueIdentifier = uniqueIdentifier
    this._object = object
  }

  public get objectType(): ObjectType {
    return this._objectType
  }

  public set objectType(value: ObjectType) {
    this._objectType = value
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get object(): KmipObject {
    return this._object as KmipObject
  }

  public set object(value: KmipObject) {
    this._object = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof GetResponse)) {
      return false
    }
    const getResponse = o
    return (
      this._objectType === getResponse.objectType &&
      this._uniqueIdentifier === getResponse.uniqueIdentifier &&
      this._object === getResponse.object
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }

  public fromTTLV(ttlv: TTLV, propertyName?: string | undefined): this {
    // The object needs to be post processed based on the object type
    defaultStructureParser(this, ttlv, propertyName ?? "ROOT")

    if (this.objectType === ObjectType.Certificate) {
      this._object = defaultStructureParser(
        new Certificate(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.CertificateRequest) {
      this._object = defaultStructureParser(
        new CertificateRequest(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.OpaqueObject) {
      this._object = defaultStructureParser(
        new OpaqueObject(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.PGPKey) {
      this._object = defaultStructureParser(
        new PGPKey(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.PrivateKey) {
      this._object = defaultStructureParser(
        new PrivateKey(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.PublicKey) {
      this._object = defaultStructureParser(
        new PublicKey(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.SecretData) {
      this._object = defaultStructureParser(
        new SecretData(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.SplitKey) {
      this._object = defaultStructureParser(
        new SplitKey(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    if (this.objectType === ObjectType.SymmetricKey) {
      this._object = defaultStructureParser(
        new SymmetricKey(),
        this._object as TTLV,
        "_object"
      )
      return this
    }
    throw new Error(`Unsupported Object Type, for a KMIP Object`)
  }
}
