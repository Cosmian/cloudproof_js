import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class CryptographicUsageMask {
  @metadata({
    name: "Sign",
    type: TtlvType.Integer,
  })
  /**
   * Allow for signing. Applies to Sign operation. Valid for PGP Key, Private Key
   */
  public Sign: number = 0x0000_0001;

  @metadata({
    name: "Verify",
    type: TtlvType.Integer,
  })
  /**
   * Allow for signature verification. Applies to Signature Verify and Validate operations. Valid for PGP Key,
   * Certificate and Public Key.
   */
  public Verify: number = 0x0000_0002;

  @metadata({
    name: "Encrypt",
    type: TtlvType.Integer,
  })
  /**
   * Allow for encryption. Applies to Encrypt operation. Valid for PGP Key, Private Key, Public Key and Symmetric Key.
   * Encryption for the purpose of wrapping is separate Wrap Key value.
   */
  public Encrypt: number = 0x0000_0004;

  @metadata({
    name: "Decrypt",
    type: TtlvType.Integer,
  })
  /**
   * Allow for decryption. Applies to Decrypt operation. Valid for PGP Key, Private Key, Public Key and Symmetric Key.
   * Decryption for the purpose of unwrapping is separate Unwrap Key value.
   */
  public Decrypt: number = 0x0000_0008;

  @metadata({
    name: "WrapKey",
    type: TtlvType.Integer,
  })
  /**
   * Allow for key wrapping. Applies to Get operation when wrapping is required by Wrapping Specification is provided
   * on the object used to Wrap. Valid for PGP Key, Private Key and Symmetric Key. Note: even if the underlying
   * wrapping mechanism is encryption, this value is logically separate.
   */
  public Wrap_Key: number = 0x0000_0010;

  @metadata({
    name: "UnwrapKey",
    type: TtlvType.Integer,
  })
  /**
   * Allow for key unwrapping. Applies to Get operation when unwrapping is required on the object used to Unwrap.
   * Valid for PGP Key, Private Key, Public Key and Symmetric Key. Not interchangeable with Decrypt. Note: even if the
   * underlying unwrapping mechanism is decryption, this value is logically separate.
   */
  public Unwrap_Key: number = 0x0000_0020;

  @metadata({
    name: "MACGenerate",
    type: TtlvType.Integer,
  })
  /**
   * Allow for MAC generation. Applies to MAC operation. Valid for Symmetric Keys
   */
  public MAC_Generate: number = 0x0000_0080;

  @metadata({
    name: "MACVerify",
    type: TtlvType.Integer,
  })
  /**
   * Allow for MAC verification. Applies to MAC Verify operation. Valid for Symmetric Keys
   */
  public MAC_Verify: number = 0x0000_0100;

  @metadata({
    name: "DeriveKey",
    type: TtlvType.Integer,
  })
  /**
   * Allow for key derivation. Applied to Derive Key operation. Valid for PGP Keys, Private Keys, Public Keys, Secret
   * Data and Symmetric Keys.
   */
  public Derive_Key: number = 0x0000_0200;

  @metadata({
    name: "KeyAgreement",
    type: TtlvType.Integer,
  })
  /**
   * Allow for Key Agreement. Valid for PGP Keys, Private Keys, Public Keys, Secret Data and Symmetric Keys
   */
  public Key_Agreement: number = 0x0000_0800;

  @metadata({
    name: "CertificateSign",
    type: TtlvType.Integer,
  })
  /**
   * Allow for Certificate Signing. Applies to Certify operation on a private key. Valid for Private Keys.
   */
  public Certificate_Sign: number = 0x0000_1000;

  @metadata({
    name: "CRLSign",
    type: TtlvType.Integer,
  })
  /**
   * Allow for CRL Sign. Valid for Private Keys
   */
  public CRL_Sign: number = 0x0000_2000;

  @metadata({
    name: "Authenticate",
    type: TtlvType.Integer,
  })
  /**
   * Allow for Authentication. Valid for Secret Data.
   */
  public Authenticate: number = 0x0010_0000;

  @metadata({
    name: "Unrestricted",
    type: TtlvType.Integer,
  })
  /**
   * Cryptographic Usage Mask contains no Usage Restrictions.
   */
  public Unrestricted: number = 0x0020_0000;

  @metadata({
    name: "FPEEncrypt",
    type: TtlvType.Integer,
  })
  /**
   * Allow for Format Preserving Encrypt. Valid for Symmetric Keys, Public Keys and Private Keys
   */
  public FPE_Encrypt: number = 0x0040_0000;

  @metadata({
    name: "FPEDecrypt",
    type: TtlvType.Integer,
  })
  /**
   * Allow for Format Preserving Decrypt. Valid for Symmetric Keys, Public Keys and Private Keys
   */
  public FPE_Decrypt: number = 0x0080_0000;
  // Extensions XXX00000
}
