import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicAlgorithm } from "./CryptographicAlgorithm"
import { CryptographicDomainParameters } from "./CryptographicDomainParameters"
import { CryptographicParameters } from "./CryptographicParameters"
import { KeyFormatType } from "./KeyFormatType"
import { Link } from "./Link"
import { ObjectType } from "./ObjectType"
import { VendorAttribute } from "./VendorAttribute"

/**
 * The following subsections describe the attributes that are associated with
 * Managed Objects. Attributes that an object MAY have multiple instances of are
 * referred to as multi-instance attributes. All instances of an attribute
 * SHOULD have a different value. Similarly, attributes which an object SHALL
 * only have at most one instance of are referred to as single-instance
 * attributes. Attributes are able to be obtained by a client from the server
 * using the Get Attribute operation. Some attributes are able to be set by the
 * Add Attribute operation or updated by the Modify Attribute operation, and
 * some are able to be deleted by the Delete Attribute operation if they no
 * longer apply to the Managed Object. Read-only attributes are attributes that
 * SHALL NOT be modified by either server or client, and that SHALL NOT be
 * deleted by a client.
 *
 * When attributes are returned by the server (e.g., via a Get Attributes
 * operation), the attribute value returned SHALL NOT differ for different
 * clients unless specifically noted against each attribute. The first table in
 * each subsection contains the attribute name in the first row. This name is
 * the canonical name used when managing attributes using the Get Attributes,
 * Get Attribute List, Add Attribute, Modify Attribute, and Delete Attribute
 * operations. A server SHALL NOT delete attributes without receiving a request
 * from a client until the object is destroyed. After an object is destroyed,
 * the server MAY retain all, some or none of the object attributes, depending
 * on the object type and server policy.
 */
export class Attributes implements KmipStruct {
  /**
   * The Link attribute is a structure used to create a link from one Managed
   * Cryptographic Object to another, closely related target Managed Cryptographic
   * Object. The link has a type, and the allowed types differ, depending on the
   * Object Type of the Managed Cryptographic Object, as listed below. The Linked
   * Object Identifier identifies the target Managed Cryptographic Object by its
   * Unique Identifier. The link contains information about the association
   * between the Managed Objects (e.g., the private key corresponding to a public
   * key; the parent certificate for a certificate in a chain; or for a derived
   * symmetric key, the base key from which it was derived). The Link attribute
   * SHOULD be present for private keys and public keys for which a certificate
   * chain is stored by the server, and for certificates in a certificate chain.
   * Note that it is possible for a Managed Object to have multiple instances of
   * the Link attribute (e.g., a Private Key has links to the associated
   * certificate, as well as the associated public key; a Certificate object has
   * links to both the public key and to the certificate of the certification
   * authority (CA) that signed the certificate). It is also possible that a
   * Managed Object does not have links to associated cryptographic objects. This
   * MAY occur in cases where the associated key material is not available to the
   * server or client (e.g., the registration of a CA Signer certificate with a
   * server, where the corresponding private key is held in a different manner)
   */
  @metadata({
    name: "Link",
    type: TtlvType.StructuresArray,
    classOrEnum: Link,
  })
  private _link?: Link[]

  /**
   * A vendor specific Attribute is a structure used for sending and receiving a
   * Managed Object attribute. The Vendor Identification and Attribute Name are
   * text-strings that are used to identify the attribute. The Attribute Value is
   * either a primitive data type or structured object, depending on the
   * attribute. Vendor identification values “x” and “y” are reserved for KMIP
   * v2.0 and later implementations referencing KMIP v1.x Custom Attributes.
   * Vendor Attributes created by the client with Vendor Identification “x” are
   * not created (provided during object creation), set, added, adjusted, modified
   * or deleted by the server. Vendor Attributes created by the server with Vendor
   * Identification “y” are not created (provided during object creation), set,
   * added, adjusted, modified or deleted by the client.
   */
  @metadata({
    name: "VendorAttributes",
    type: TtlvType.StructuresArray,
    classOrEnum: VendorAttribute,
  })
  private _vendor_attributes?: VendorAttribute[]

  /**
   * The Object Typeof a Managed Object (e.g., public key, private key, symmetric
   * key, etc.) SHALL be set by the server when the object is created or
   * registered and then SHALL NOT be changed or deleted before the object is
   * destroyed.
   */

  @metadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectType,
  })
  private _object_type: ObjectType

  /**
   * The Activation Date attribute contains the date and time when the Managed
   * Object MAY begin to be used. This time corresponds to state transition. The
   * object SHALL NOT be used for any cryptographic purpose before the Activation
   * Date has been reached. Once the state transition from Pre-Active has
   * occurred, then this attribute SHALL NOT be changed or deleted before the
   * object is destroyed.
   */

  @metadata({
    name: "ActivationDate",
    type: TtlvType.Integer,
  })
  private _activation_date?: number // epoch milliseconds

  /**
   * The Cryptographic Algorithm of an object. The Cryptographic Algorithm of a
   * Certificate object identifies the algorithm for the public key contained
   * within the Certificate. The digital signature algorithm used to sign the
   * Certificate is identified in the Digital Signature Algorithm attribute. This
   * attribute SHALL be set by the server when the object is created or registered
   * and then SHALL NOT be changed or deleted before the object is destroyed.
   */

  @metadata({
    name: "CryptographicAlgorithm",
    type: TtlvType.Enumeration,
    classOrEnum: CryptographicAlgorithm,
  })
  private _cryptographic_algorithm?: CryptographicAlgorithm

  /**
   * For keys, Cryptographic Length is the length in bits of the clear-text
   * cryptographic key material of the Managed Cryptographic Object. For
   * certificates, Cryptographic Length is the length in bits of the public key
   * contained within the Certificate. This attribute SHALL be set by the server
   * when the object is created or registered, and then SHALL NOT be changed or
   * deleted before the object is destroyed.
   */

  @metadata({
    name: "CryptographicLength",
    type: TtlvType.Integer,
  })
  private _cryptographic_length?: number

  /**
   * The Cryptographic Domain Parameters attribute is a structure that contains
   * fields that MAY need to be specified in the Create Key Pair Request Payload.
   * Specific fields MAY only pertain to certain types of Managed Cryptographic
   * Objects. The domain parameter Q-length corresponds to the bit length of
   * parameter Q (refer to [RFC7778],[SEC2]and [SP800-56A]).
   */

  @metadata({
    name: "CryptographicDomainParameters",
    type: TtlvType.Structure,
    classOrEnum: CryptographicDomainParameters,
  })
  private _cryptographic_domain_parameters?: CryptographicDomainParameters

  /**
   * @see CryptographicParameters
   */
  @metadata({
    name: "CryptographicParameters",
    type: TtlvType.Structure,
    classOrEnum: CryptographicParameters,
  })
  private _cryptographicParameters?: CryptographicParameters

  /**
   * The Cryptographic Usage Mask attribute defines the cryptographic usage of a
   * key. This is a bit mask that indicates to the client which cryptographic
   * functions MAY be performed using the key, and which ones SHALL NOT be
   * performed.
   *
   * @see CryptographicUsageMask
   */

  @metadata({
    name: "CryptographicUsageMask",
    type: TtlvType.Integer,
  })
  private _cryptographic_usage_mask?: number

  /**
   * 4.26 The Key Format Type attribute is a required attribute of a Cryptographic
   * Object. It is set by the server, but a particular Key Format Type MAY be
   * requested by the client if the cryptographic material is produced by the
   * server (i.e., Create, Create Key Pair, Create Split Key, Re-key, Re-key Key
   * Pair, Derive Key) on the client’s behalf. The server SHALL comply with the
   * client’s requested format or SHALL fail the request. When the server
   * calculates a Digest for the object, it SHALL compute the digest on the data
   * in the assigned Key Format Type, as well as a digest in the default KMIP Key
   * Format Type for that type of key and the algorithm requested (if a
   * non-default value is specified).
   */
  @metadata({
    name: "KeyFormatType",
    type: TtlvType.Enumeration,
    classOrEnum: KeyFormatType,
  })
  private _key_format_type?: KeyFormatType

  constructor(
    objectType: ObjectType,
    link?: Link[],
    vendorAttributes?: VendorAttribute[],
    activationDate?: number,
    cryptographicAlgorithm?: CryptographicAlgorithm,
    cryptographicLength?: number,
    cryptographicDomainParameters?: CryptographicDomainParameters,
    cryptographicParameters?: CryptographicParameters,
    cryptographicUsageMask?: number,
    keyFormatType?: KeyFormatType
  ) {
    this._object_type = objectType
    this._activation_date = activationDate
    this._cryptographic_algorithm = cryptographicAlgorithm
    this._cryptographic_length = cryptographicLength
    this._cryptographic_domain_parameters = cryptographicDomainParameters
    this._cryptographicParameters = cryptographicParameters
    this._cryptographic_usage_mask = cryptographicUsageMask
    this._key_format_type = keyFormatType
    this._link = link
    this._vendor_attributes = vendorAttributes
  }

  public get link(): Link[] | undefined {
    return this._link
  }

  public set link(value: Link[] | undefined) {
    this._link = value
  }

  public get vendorAttributes(): VendorAttribute[] | undefined {
    return this._vendor_attributes
  }

  public set vendorAttributes(value: VendorAttribute[] | undefined) {
    this._vendor_attributes = value
  }

  public get keyFormatType(): KeyFormatType | undefined {
    return this._key_format_type
  }

  public set keyFormatType(value: KeyFormatType | undefined) {
    this._key_format_type = value
  }

  public get cryptographicUsageMask(): number | undefined {
    return this._cryptographic_usage_mask
  }

  public set cryptographicUsageMask(value: number | undefined) {
    this._cryptographic_usage_mask = value
  }

  public get cryptographicParameters(): CryptographicParameters | undefined {
    return this._cryptographicParameters
  }

  public set cryptographicParameters(
    value: CryptographicParameters | undefined
  ) {
    this._cryptographicParameters = value
  }

  public get cryptographicDomainParameters():
    | CryptographicDomainParameters
    | undefined {
    return this._cryptographic_domain_parameters
  }

  public set cryptographicDomainParameters(
    value: CryptographicDomainParameters | undefined
  ) {
    this._cryptographic_domain_parameters = value
  }

  public get cryptographicLength(): number | undefined {
    return this._cryptographic_length
  }

  public set cryptographicLength(value: number | undefined) {
    this._cryptographic_length = value
  }

  public get cryptographicAlgorithm(): CryptographicAlgorithm | undefined {
    return this._cryptographic_algorithm
  }

  public set cryptographicAlgorithm(value: CryptographicAlgorithm | undefined) {
    this._cryptographic_algorithm = value
  }

  public get activationDate(): number | undefined {
    return this._activation_date
  }

  public set activationDate(value: number | undefined) {
    this._activation_date = value
  }

  public get objectType(): ObjectType {
    return this._object_type
  }

  public set objectType(value: ObjectType) {
    this._object_type = value
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
