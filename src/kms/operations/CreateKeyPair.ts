import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"

/**
 * This operation requests the server to generate a new public/private key pair
 * and register the two corresponding new Managed Cryptographic Object The
 * request contains attributes to be assigned to the objects (e.g.,
 * Cryptographic Algorithm, Cryptographic Length, etc.). Attributes MAY be
 * specified for both keys at the same time by specifying a Common Attributes
 * object in the request. Attributes not common to both keys (e.g., Name,
 * Cryptographic Usage Mask) MAY be specified using the Private Key Attributes
 * and Public Key Attributes objects in the request, which take precedence over
 * the Common Attributes object. For the Private Key, the server SHALL create a
 * Link attribute of Link Type Public Key pointing to the Public Key. For the
 * Public Key, the server SHALL create a Link attribute of Link Type Private Key
 * pointing to the Private Key. The response contains the Unique Identifiers of
 * both created objects. The ID Placeholder value SHALL be set to the Unique
 * Identifier of the Private Key
 */
export class CreateKeyPair implements KmipStruct {
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
    commonAttributes?: Attributes,
    privateKeyAttributes?: Attributes,
    publicKeyAttributes?: Attributes,
    commonProtectionStorageMasks?: number,
    privateProtectionStorageMasks?: number,
    publicProtectionStorageMasks?: number
  ) {
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
    if (!(o instanceof CreateKeyPair)) {
      return false
    }
    const createKeyPair = o
    return (
      this._commonAttributes === createKeyPair.commonAttributes &&
      this._privateKeyAttributes === createKeyPair.privateKeyAttributes &&
      this._publicKeyAttributes === createKeyPair.publicKeyAttributes &&
      this._commonProtectionStorageMasks ===
      createKeyPair.commonProtectionStorageMasks &&
      this._privateProtectionStorageMasks ===
      createKeyPair.privateProtectionStorageMasks &&
      this._publicProtectionStorageMasks ===
      createKeyPair.publicProtectionStorageMasks
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
