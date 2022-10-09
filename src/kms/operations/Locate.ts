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
  private _maximum_items?: number

  /// An Integer object that indicates the number of object identifiers to
  /// skip that satisfy the identification criteria specified in the request.
  @metadata({
    name: "OffsetItems",
    type: TtlvType.Integer,
  })
  private _offset_items?: number

  /// An Integer object (used as a bit mask) that indicates whether only
  /// on-line objects, only archived objects, destroyed objects or any
  /// combination of these, are to be searched. If omitted, then only on-line
  /// objects SHALL be returned.
  /// @see StorageStatusMask
  @metadata({
    name: "StorageStatusMask",
    type: TtlvType.Integer,
  })
  private _storage_status_mask?: number

  /// An Enumeration object that indicates the object group member type.
  @metadata({
    name: "ObjectGroupMember",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectGroupMember,
  })
  private _object_group_member?: ObjectGroupMember

  /// Specifies an attribute and its value(s) that are REQUIRED to match those
  /// in a candidate object (according to the matching rules defined above).
  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
  })
  private _attributes: Attributes

  constructor(
    attributes: Attributes,
    maximum_items?: number,
    offset_items?: number,
    storage_status_mask?: number,
    object_group_member?: ObjectGroupMember
  ) {
    this._maximum_items = maximum_items
    this._offset_items = offset_items
    this._storage_status_mask = storage_status_mask
    this._object_group_member = object_group_member
    this._attributes = attributes
  }

  public get maximum_items(): number | undefined {
    return this._maximum_items
  }

  public set maximum_items(value: number | undefined) {
    this._maximum_items = value
  }

  public get offset_items(): number | undefined {
    return this._offset_items
  }

  public set offset_items(value: number | undefined) {
    this._offset_items = value
  }

  public get storage_status_mask(): number | undefined {
    return this._storage_status_mask
  }

  public set storage_status_mask(value: number | undefined) {
    this._storage_status_mask = value
  }

  public get object_group_member(): ObjectGroupMember | undefined {
    return this._object_group_member
  }

  public set object_group_member(value: ObjectGroupMember | undefined) {
    this._object_group_member = value
  }

  public get attributes(): Attributes {
    return this._attributes
  }

  public set attributes(value: Attributes) {
    this._attributes = value
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true
    }
    if (!(o instanceof Locate)) {
      return false
    }
    const locate = o
    return (
      this._maximum_items === locate.maximum_items &&
      this._offset_items === locate.offset_items &&
      this._storage_status_mask === locate.storage_status_mask &&
      this._attributes === locate.attributes
    )
  }

  public toString(): string {
    return (
      "{" +
      " maximum_items='" +
      this._maximum_items +
      "'" +
      ", offset_items='" +
      this._offset_items +
      "'" +
      ", storage_status_mask='" +
      this._storage_status_mask +
      "'" +
      ", object_group_member='" +
      this._object_group_member +
      "'" +
      ", attributes='" +
      this._attributes +
      "'" +
      "}"
    )
  }
}
