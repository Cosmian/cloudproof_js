import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"
import { ObjectGroupMember } from "../types/ObjectGroupMember"

export class Locate implements KmipStruct {
  /// An Integer object that indicates the maximum number of object
  /// identifiers the server MAY return.
  @metadata({
    name: "MaximumItems",
    type: TtlvType.Integer,
  })
  private _maximumItems?: number

  /// An Integer object that indicates the number of object identifiers to
  /// skip that satisfy the identification criteria specified in the request.
  @metadata({
    name: "OffsetItems",
    type: TtlvType.Integer,
  })
  private _offsetItems?: number

  /// An Integer object (used as a bit mask) that indicates whether only
  /// on-line objects, only archived objects, destroyed objects or any
  /// combination of these, are to be searched. If omitted, then only on-line
  /// objects SHALL be returned.
  /// @see StorageStatusMask
  @metadata({
    name: "StorageStatusMask",
    type: TtlvType.Integer,
  })
  private _storageStatusMask?: number

  /// An Enumeration object that indicates the object group member type.
  @metadata({
    name: "ObjectGroupMember",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectGroupMember,
  })
  private _objectGroupMember?: ObjectGroupMember

  /// Specifies an attribute and its value(s) that are REQUIRED to match those
  /// in a candidate object (according to the matching rules defined above).
  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
  })
  private _attributes: Attributes

  constructor(
    attributes: Attributes,
    maximumItems?: number,
    offsetItems?: number,
    storageStatusMask?: number,
    objectGroupMember?: ObjectGroupMember,
  ) {
    this._maximumItems = maximumItems
    this._offsetItems = offsetItems
    this._storageStatusMask = storageStatusMask
    this._objectGroupMember = objectGroupMember
    this._attributes = attributes
  }

  public get maximum_items(): number | undefined {
    return this._maximumItems
  }

  public set maximum_items(value: number | undefined) {
    this._maximumItems = value
  }

  public get offset_items(): number | undefined {
    return this._offsetItems
  }

  public set offset_items(value: number | undefined) {
    this._offsetItems = value
  }

  public get storage_status_mask(): number | undefined {
    return this._storageStatusMask
  }

  public set storage_status_mask(value: number | undefined) {
    this._storageStatusMask = value
  }

  public get object_group_member(): ObjectGroupMember | undefined {
    return this._objectGroupMember
  }

  public set object_group_member(value: ObjectGroupMember | undefined) {
    this._objectGroupMember = value
  }

  public get attributes(): Attributes {
    return this._attributes
  }

  public set attributes(value: Attributes) {
    this._attributes = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Locate)) {
      return false
    }
    const locate = o
    return (
      this._maximumItems === locate.maximum_items &&
      this._offsetItems === locate.offset_items &&
      this._storageStatusMask === locate.storage_status_mask &&
      this._attributes === locate.attributes
    )
  }

  public toString(): string {
    return `{ MaximumItems='${
      this._maximumItems?.toString() as string
    }', OffsetItems='${
      this._offsetItems?.toString() as string
    }', StorageStatusMask='${
      this._storageStatusMask?.toString() as string
    }', ObjectGroupMember='${
      this._objectGroupMember?.toString() as string
    }', Attributes='${this._attributes.toString()}'}`
  }
}
