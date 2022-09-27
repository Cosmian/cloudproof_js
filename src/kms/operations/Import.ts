/**
 * This operation requests the server to Import a Managed Object specified by
 * its Unique Identifier. The request specifies the object being imported and
 * all the attributes to be assigned to the object. The attribute rules for each
 * attribute for “Initially set by” and “When implicitly set” SHALL NOT be
 * enforced as all attributes MUST be set to the supplied values rather than any
 * server generated values.
 *
 * The response contains the Unique Identifier provided in the request or
 * assigned by the server. The server SHALL copy the Unique Identifier returned
 * by this operations into the ID Placeholder variable.
 * https://docs.oasis-open.org/kmip/kmip-spec/v2.1/os/kmip-spec-v2.1-os.html#_Toc57115657
 */

import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { KmipObject } from "../objects/KmipObject";
import { TtlvType } from "../serialize/TtlvType";
import { Attributes } from "../types/Attributes";
import { KeyWrapType } from "../types/KeyWrapType";
import { ObjectType } from "../types/ObjectType";

export class Import implements KmipStruct {
  // The Unique Identifier of the object to be imported
  @PropertyMetadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string;

  // Determines the type of object being imported.
  @PropertyMetadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    isEnum: ObjectType,
  })
  private _objectType: ObjectType;

  // A Boolean. If specified and true then any existing object with the same
  // Unique Identifier SHALL be replaced by this operation.
  // If absent or false and an object exists with the same Unique Identifier then
  // an error SHALL be returned.
  @PropertyMetadata({
    name: "ReplaceExisting",
    type: TtlvType.Boolean,
  })
  private _replaceExisting?: boolean;

  // If Not Wrapped then the server SHALL unwrap the object before storing it,
  // and return an error if the wrapping key is not available.
  // Otherwise the server SHALL store the object as provided.
  @PropertyMetadata({
    name: "KeyWrapType",
    type: TtlvType.Enumeration,
    isEnum: KeyWrapType,
  })
  private _keyWrapType?: KeyWrapType;

  public get keyWrapType(): KeyWrapType | undefined {
    return this._keyWrapType;
  }

  public set keyWrapType(value: KeyWrapType | undefined) {
    this._keyWrapType = value;
  }

  // Specifies object attributes to be associated with the new object.
  @PropertyMetadata({
    name: "Attributes",
    type: TtlvType.Structure,
  })
  private _attributes: Attributes;

  // The object being imported. The object and attributes MAY be wrapped.
  @PropertyMetadata({
    name: "Object",
    type: TtlvType.Structure,
  })
  private _object: KmipObject;

  constructor(
    uniqueIdentifier: string,
    objectType: ObjectType,
    attributes: Attributes,
    object: KmipObject,
    replaceExisting?: boolean,
    keyWrapType?: KeyWrapType
  ) {
    this._uniqueIdentifier = uniqueIdentifier;
    this._objectType = objectType;
    this._replaceExisting = replaceExisting;
    this._keyWrapType = keyWrapType;
    this._attributes = attributes;
    this._object = object;
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier;
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value;
  }

  public get objectType(): ObjectType {
    return this._objectType;
  }

  public set objectType(value: ObjectType) {
    this._objectType = value;
  }

  public get replaceExisting(): boolean | undefined {
    return this._replaceExisting;
  }

  public set replaceExisting(value: boolean | undefined) {
    this._replaceExisting = value;
  }

  public get attributes(): Attributes {
    return this._attributes;
  }

  public set attributes(value: Attributes) {
    this._attributes = value;
  }

  public get object(): KmipObject {
    return this._object;
  }

  public set object(value: KmipObject) {
    this._object = value;
  }
}
