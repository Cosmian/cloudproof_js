import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";
import { BlockCipherMode } from "./BlockCipherMode";
import { CryptographicAlgorithm } from "./CryptographicAlgorithm";
import { DigitalSignatureAlgorithm } from "./DigitalSignatureAlgorithm";
import { HashingAlgorithm } from "./HashingAlgorithm";
import { KeyRoleType } from "./KeyRoleType";
import { MaskGenerator } from "./MaskGenerator";
import { PaddingMethod } from "./PaddingMethod";

/**
 * The Cryptographic Parameters attribute is a structure that contains a set of OPTIONAL fields that describe certain
 * cryptographic parameters to be used when performing cryptographic operations using the object. Specific fields MAY
 * pertain only to certain types of Managed Objects. The Cryptographic Parameters attribute of a Certificate object
 * identifies the cryptographic parameters of the public key contained within the Certificate.
 *
 * The Cryptographic Algorithm is also used to specify the parameters for cryptographic operations. For operations
 * involving digital signatures, either the Digital Signature Algorithm can be specified or the Cryptographic Algorithm
 * and Hashing Algorithm combination can be specified. Random IV can be used to request that the KMIP server generate an
 * appropriate IV for a cryptographic operation that uses an IV. The generated Random IV is returned in the response to
 * the cryptographic operation.
 *
 * IV Length is the length of the Initialization Vector in bits. This parameter SHALL be provided when the specified
 * Block Cipher Mode supports variable IV lengths such as CTR or GCM. Tag Length is the length of the authenticator tag
 * in bytes. This parameter SHALL be provided when the Block Cipher Mode is GCM.
 *
 * The IV used with counter modes of operation (e.g., CTR and GCM) cannot repeat for a given cryptographic key. To
 * prevent an IV/key reuse, the IV is often constructed of three parts: a fixed field, an invocation field, and a
 * counter as described in [SP800-38A] and [SP800-38D]. The Fixed Field Length is the length of the fixed field portion
 * of the IV in bits. The Invocation Field Length is the length of the invocation field portion of the IV in bits. The
 * Counter Length is the length of the counter portion of the IV in bits.
 *
 * Initial Counter Value is the starting counter value for CTR mode (for [RFC3686] it is 1).
 */
export class CryptographicParameters {
  @PropertyMetadata({
    name: "BlockCipherMode",
    type: TtlvType.Enumeration,
    isEnum: BlockCipherMode,
  })
  public block_cipher_mode?: BlockCipherMode = undefined;

  @PropertyMetadata({
    name: "PaddingMethod",
    type: TtlvType.Enumeration,
    isEnum: PaddingMethod,
  })
  public padding_method?: PaddingMethod = undefined;

  @PropertyMetadata({
    name: "HashingAlgorithm",
    type: TtlvType.Enumeration,
    isEnum: HashingAlgorithm,
  })
  public hashing_algorithm?: HashingAlgorithm = undefined;

  @PropertyMetadata({
    name: "KeyRoleType",
    type: TtlvType.Enumeration,
    isEnum: KeyRoleType,
  })
  public key_role_type?: KeyRoleType = undefined;

  @PropertyMetadata({
    name: "FixedFieldLenght",
    type: TtlvType.Integer,
  })
  public fixed_field_length?: number = undefined;

  @PropertyMetadata({
    name: "DigitalSignatureAlgorithm",
    type: TtlvType.Enumeration,
    isEnum: DigitalSignatureAlgorithm,
  })
  public digital_signature_algorithm?: DigitalSignatureAlgorithm = undefined;

  @PropertyMetadata({
    name: "CryptographicAlgorithm",
    type: TtlvType.Enumeration,
    isEnum: CryptographicAlgorithm,
  })
  public cryptographic_algorithm?: CryptographicAlgorithm = undefined;

  @PropertyMetadata({
    name: "RandomIv",
    type: TtlvType.Boolean,
  })
  public random_iv?: Boolean = undefined;

  @PropertyMetadata({
    name: "IvLength",
    type: TtlvType.Integer,
  })
  public iv_length?: number = undefined;

  @PropertyMetadata({
    name: "TagLength",
    type: TtlvType.Integer,
  })
  public tag_length?: number = undefined;

  @PropertyMetadata({
    name: "InvocationFieldLength",
    type: TtlvType.Integer,
  })
  public invocation_field_length?: number = undefined;

  @PropertyMetadata({
    name: "CounterLength",
    type: TtlvType.Integer,
  })
  public counter_length?: number = undefined;

  @PropertyMetadata({
    name: "InitialCounterValue",
    type: TtlvType.Integer,
  })
  public initial_counter_value?: number = undefined;
  /// if omitted, defaults to the block size of the Mask Generator Hashing Algorithm
  /// Cosmian extension: In AES: used as the number of additional data at the end of the
  /// submitted data that become part of the MAC calculation. These additional data are removed
  /// from the encrypted data

  @PropertyMetadata({
    name: "SaltLength",
    type: TtlvType.Integer,
  })
  public salt_length?: number = undefined;

  /// if omitted defaults to MGF1
  @PropertyMetadata({
    name: "MaskGenerator",
    type: TtlvType.Enumeration,
    isEnum: MaskGenerator,
  })
  public mask_generator?: MaskGenerator = undefined;

  /// if omitted defaults to SHA-1
  @PropertyMetadata({
    name: "MaskGeneratorHashingAlgorithm",
    type: TtlvType.Enumeration,
    isEnum: HashingAlgorithm,
  })
  public mask_generator_hashing_algorithm?: HashingAlgorithm = undefined;

  @PropertyMetadata({
    name: "PSource",
    type: TtlvType.ByteString,
  })
  public p_source?: Uint8Array = undefined;

  @PropertyMetadata({
    name: "TrailerField",
    type: TtlvType.Integer,
  })
  public trailer_field?: number = undefined;

  public static empty(): CryptographicParameters {
    return new CryptographicParameters();
  }
}
