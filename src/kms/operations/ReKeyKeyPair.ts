import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"

/**
 * This request is used to generate a replacement key pair for an existing public/private key pair. It is analogous to
 * the Create Key Pair operation, except that attributes of the replacement key pair are copied from the existing key
 * pair, with the exception of the attributes listed in Re-key Key Pair Attribute Requirements tor. As the replacement
 * of the key pair takes over the name attribute for the existing public/private key pair, Re-key Key Pair SHOULD only
 * be performed once on a given key pair. For both the existing public key and private key, the server SHALL create a
 * Link attribute of Link Type Replacement Key pointing to the replacement public and private key, respectively. For
 * both the replacement public and private key, the server SHALL create a Link attribute of Link Type Replaced Key
 * pointing to the existing public and private key, respectively. The server SHALL copy the Private Key Unique
 * Identifier of the replacement private key returned by this operation into the ID Placeholder variable. An Offset MAY
 * be used to indicate the difference between the Initial Date and the Activation Date of the replacement key pair. If
 * no Offset is specified, the Activation Date and Deactivation Date values are copied from the existing key pair. If
 * Offset is set and dates exist for the existing key pair, then the dates of the replacement key pair SHALL be set
 * based on the dates of the existing key pair as follows
 */
export class ReKeyKeyPair implements KmipStruct {
  tag = "ReKeyKeyPair";
  
  @metadata({
    name: "PrivateKeyUniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _privateKeyUniqueIdentifier: string

  public get privateKeyUniqueIdentifier(): string {
    return this._privateKeyUniqueIdentifier
  }

  public set privateKeyUniqueIdentifier(value: string) {
    this._privateKeyUniqueIdentifier = value
  }

  @metadata({
    name: "Offset",
    type: TtlvType.Integer,
  })
  private _offset?: number | undefined

  public get offset(): number | undefined {
    return this._offset
  }

  public set offset(value: number | undefined) {
    this._offset = value
  }

  @metadata({
    name: "CommonAttributes",
    type: TtlvType.Structure,
  })
  /**
   * Specifies desired attributes to be associated with the new object that apply
   * to both the Private and Public Key Objects
   */
  private _commonAttributes?: Attributes

  public get commonAttributes(): Attributes | undefined {
    return this._commonAttributes
  }

  public set commonAttributes(value: Attributes | undefined) {
    this._commonAttributes = value
  }

  @metadata({
    name: "PrivateKeyAttributes",
    type: TtlvType.Structure,
  })
  /**
   * Specifies the attributes to be associated with the new object that apply to
   * the Private Key Object.
   */
  private _privateKeyAttributes?: Attributes

  public get privateKeyAttributes(): Attributes | undefined {
    return this._privateKeyAttributes
  }

  public set privateKeyAttributes(value: Attributes | undefined) {
    this._privateKeyAttributes = value
  }

  @metadata({
    name: "PublicKeyAttributes",
    type: TtlvType.Structure,
  })
  /**
   * Specifies the attributes to be associated with the new object that apply to
   * the Public Key Object.
   */
  private _publicKeyAttributes?: Attributes

  public get publicKeyAttributes(): Attributes | undefined {
    return this._publicKeyAttributes
  }

  public set publicKeyAttributes(value: Attributes | undefined) {
    this._publicKeyAttributes = value
  }

  @metadata({
    name: "CommonProtectionStorageMasks",
    type: TtlvType.Integer,
  })
  /**
   * Specifies all ProtectionStorage Mask selections that are permissible for the
   * new Private Key and Public Key objects.
   */
  private _commonProtectionStorageMasks?: number

  public get commonProtectionStorageMasks(): number | undefined {
    return this._commonProtectionStorageMasks
  }

  public set commonProtectionStorageMasks(value: number | undefined) {
    this._commonProtectionStorageMasks = value
  }

  @metadata({
    name: "PrivateProtectionStorageMasks",
    type: TtlvType.Integer,
  })
  /**
   * Specifies all ProtectionStorage Mask selections that are permissible for the
   * new Private Key object.
   */
  private _privateProtectionStorageMasks?: number

  public get privateProtectionStorageMasks(): number | undefined {
    return this._privateProtectionStorageMasks
  }

  public set privateProtectionStorageMasks(value: number | undefined) {
    this._privateProtectionStorageMasks = value
  }

  @metadata({
    name: "PublicProtectionStorageMasks",
    type: TtlvType.Integer,
  })
  /**
   * Specifies all ProtectionStorage Mask selections that are permissible for the
   * new PublicKey object.
   */
  private _publicProtectionStorageMasks?: number

  public get publicProtectionStorageMasks(): number | undefined {
    return this._publicProtectionStorageMasks
  }

  public set publicProtectionStorageMasks(value: number | undefined) {
    this._publicProtectionStorageMasks = value
  }

  constructor(
    privateKeyUniqueIdentifier: string,
    offset?: number,
    commonAttributes?: Attributes,
    privateKeyAttributes?: Attributes,
    publicKeyAttributes?: Attributes,
    commonProtectionStorageMasks?: number,
    privateProtectionStorageMasks?: number,
    publicProtectionStorageMasks?: number,
  ) {
    this._privateKeyUniqueIdentifier = privateKeyUniqueIdentifier
    this._offset = offset
    this._commonAttributes = commonAttributes
    this._privateKeyAttributes = privateKeyAttributes
    this._publicKeyAttributes = publicKeyAttributes
    this._commonProtectionStorageMasks = commonProtectionStorageMasks
    this._privateProtectionStorageMasks = privateProtectionStorageMasks
    this._publicProtectionStorageMasks = publicProtectionStorageMasks
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof ReKeyKeyPair)) {
      return false
    }
    const reKeyKeyPair = o
    return (
      this._privateKeyUniqueIdentifier ===
        reKeyKeyPair.privateKeyUniqueIdentifier &&
      this._offset === reKeyKeyPair.offset &&
      this._commonAttributes === reKeyKeyPair.commonAttributes &&
      this._privateKeyAttributes === reKeyKeyPair.privateKeyAttributes &&
      this._publicKeyAttributes === reKeyKeyPair.publicKeyAttributes &&
      this._commonProtectionStorageMasks ===
        reKeyKeyPair.commonProtectionStorageMasks &&
      this._privateProtectionStorageMasks ===
        reKeyKeyPair.privateProtectionStorageMasks &&
      this._publicProtectionStorageMasks ===
        reKeyKeyPair.publicProtectionStorageMasks
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
