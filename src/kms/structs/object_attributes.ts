import { ObjectType } from "./objects"
import {
  CryptographicAlgorithm,
  KeyFormatType,
  RecommendedCurve,
} from "./object_data_structures"

export class Attributes {
  tag = "Attributes"

  objectType: ObjectType
  link: Link[] = []
  vendorAttributes: VendorAttributes[] = []
  activationDate: number | null = null // epoch milliseconds
  cryptographicAlgorithm: CryptographicAlgorithm | null = null
  cryptographicLength: number | null = null
  cryptographicDomainParameters: CryptographicDomainParameters | null = null
  cryptographicParameters: CryptographicParameters | null = null
  cryptographicUsageMask: number | null = null
  keyFormatType: KeyFormatType | null = null

  constructor(
    objectType: ObjectType,
    link: Link[] = [],
    vendorAttributes: VendorAttributes[] = [],
    activationDate: number | null = null,
    cryptographicAlgorithm: CryptographicAlgorithm | null = null,
    cryptographicLength: number | null = null,
    cryptographicDomainParameters: CryptographicDomainParameters | null = null,
    cryptographicParameters: CryptographicParameters | null = null,
    cryptographicUsageMask: number | null = null,
    keyFormatType: KeyFormatType | null = null,
  ) {
    this.objectType = objectType
    this.link = link
    this.vendorAttributes = vendorAttributes
    this.activationDate = activationDate
    this.cryptographicAlgorithm = cryptographicAlgorithm
    this.cryptographicLength = cryptographicLength
    this.cryptographicDomainParameters = cryptographicDomainParameters
    this.cryptographicParameters = cryptographicParameters
    this.cryptographicUsageMask = cryptographicUsageMask
    this.keyFormatType = keyFormatType
  }
}

export enum LinkType {
  /// For Certificate objects: the parent certificate for a certificate in a
  /// certificate chain. For Public Key objects: the corresponding certificate(s),
  /// containing the same public key.
  CertificateLink = 0x0000_0101,
  /// For a Private Key object: the public key corresponding to the private key.
  /// For a Certificate object: the public key contained in the certificate.
  PublicKeyLink = 0x0000_0102,
  /// For a Public Key object: the private key corresponding to the public key.
  PrivateKeyLink = 0x0000_0103,
  /// For a derived Symmetric Key or Secret Data object: the object(s) from
  /// which the current symmetric key was derived.
  DerivationBaseObjectLink = 0x0000_0104,
  /// The symmetric key(s) or Secret Data object(s) that were derived from
  /// the current object.
  DerivedKeyLink = 0x0000_0105,
  /// For a Symmetric Key, an Asymmetric Private Key, or an Asymmetric
  /// Public Key object: the key that resulted from the re-key of the current
  /// key. For a Certificate object: the certificate that resulted from the re-
  /// certify. Note that there SHALL be only one such replacement object per
  /// Managed Object.
  ReplacementObjectLink = 0x0000_0106,
  /// For a Symmetric Key, an Asymmetric Private Key, or an Asymmetric
  /// Public Key object: the key that was re-keyed to obtain the current key.
  /// For a Certificate object: the certificate that was re-certified to obtain
  /// the
  /// current certificate.
  ReplacedObjectLink = 0x0000_0107,
  /// For all object types: the container or other parent object corresponding
  /// to the object.
  ParentLink = 0x0000_0108,
  /// For all object types: the subordinate, derived or other child object
  /// corresponding to the object.
  ChildLink = 0x0000_0109,
  /// For all object types: the previous object to this object.
  PreviousLink = 0x0000_010a,
  /// For all object types: the next object to this object.
  NextLink = 0x0000_010b,
  PKCS12CertificateLink = 0x0000_010c,
  PKCS12PasswordLink = 0x0000_010d,
  /// For wrapped objects: the object that was used to wrap this object.
  WrappingKeyLink = 0x0000_010e,
}

export enum LinkedUniqueIdentifier {
  ID_Placeholder = 0x0000_0001,
  Certify = 0x0000_0002,
  Create = 0x0000_0003,
  Create_Key_Pair = 0x0000_0004,
  Create_Key_Pair_Private_Key = 0x0000_0005,
  Create_Key_Pair_Public_Key = 0x0000_0006,
  Create_Split_Key = 0x0000_0007,
  Derive_Key = 0x0000_0008,
  Import = 0x0000_0009,
  Join_Split_Key = 0x0000_000a,
  Locate = 0x0000_000b,
  Register = 0x0000_000c,
  Re_key = 0x0000_000d,
  Re_certify = 0x0000_000e,
  Re_key_Key_Pair = 0x0000_000f,
  Re_key_Key_Pair_Private_Key = 0x0000_0010,
  Re_key_Key_Pair_Public_Key = 0x0000_0011,
}

export class Link {
  tag = "Link"

  linkType: LinkType
  linkedObjectIdentifier: string | number | LinkedUniqueIdentifier

  constructor(
    linkType: LinkType,
    linkedObjectIdentifier: string | number | LinkedUniqueIdentifier,
  ) {
    this.linkType = linkType
    this.linkedObjectIdentifier = linkedObjectIdentifier
  }
}

export class VendorAttributes {
  tag = "VendorAttributes"

  public static VENDOR_ID_COSMIAN = "cosmian"

  public static VENDOR_ATTR_ABE_ATTR = "abe_attributes"

  public static VENDOR_ATTR_ABE_POLICY = "abe_policy"

  public static VENDOR_ATTR_ABE_ACCESS_POLICY = "abe_access_policy"

  public static VENDOR_ATTR_COVER_CRYPT_ATTR = "cover_crypt_attributes"

  public static VENDOR_ATTR_COVER_CRYPT_POLICY = "cover_crypt_policy"

  public static VENDOR_ATTR_COVER_CRYPT_ACCESS_POLICY =
    "cover_crypt_access_policy"

  vendorIdentification: string
  attributeName: string
  attributeValue: Uint8Array

  constructor(
    vendorIdentification: string,
    attributeName: string,
    attributeValue: Uint8Array,
  ) {
    this.vendorIdentification = vendorIdentification
    this.attributeName = attributeName
    this.attributeValue = attributeValue
  }
}

export class CryptographicDomainParameters {
  qlength: number | null = null
  recommendedCurve: RecommendedCurve | null = null

  constructor(
    qlength: number | null = null,
    recommendedCurve: RecommendedCurve | null = null,
  ) {
    this.qlength = qlength
    this.recommendedCurve = recommendedCurve
  }
}

export enum BlockCipherMode {
  CBC = 0x0000_0001,
  ECB = 0x0000_0002,
  PCBC = 0x0000_0003,
  CFB = 0x0000_0004,
  OFB = 0x0000_0005,
  CTR = 0x0000_0006,
  CMAC = 0x0000_0007,
  CCM = 0x0000_0008,
  GCM = 0x0000_0009,
  CBC_MAC = 0x0000_000a,
  XTS = 0x0000_000b,
  X9_102_AESKW = 0x0000_000e,
  X9_102_TDKW = 0x0000_000f,
  X9_102_AKW1 = 0x0000_0010,
  X9_102_AKW2 = 0x0000_0011,
  AEAD = 0x0000_0012,
}

export enum PaddingMethod {
  None = 0x0000_0001,
  OAEP = 0x0000_0002,
  PKCS5 = 0x0000_0003,
  SSL3 = 0x0000_0004,
  Zeros = 0x0000_0005,
  ANSI_X9_23 = 0x0000_0006,
  ISO_10126 = 0x0000_0007,
  PKCS1_v1_5 = 0x0000_0008,
  X9_31 = 0x0000_0009,
  PSS = 0x0000_000a,
}

export enum HashingAlgorithm {
  MD2 = 0x0000_0001,
  MD4 = 0x0000_0002,
  MD5 = 0x0000_0003,
  SHA_1 = 0x0000_0004,
  SHA_224 = 0x0000_0005,
  SHA_256 = 0x0000_0006,
  SHA_384 = 0x0000_0007,
  SHA_512 = 0x0000_0008,
  RIPEMD_160 = 0x0000_0009,
  Tiger = 0x0000_000a,
  Whirlpool = 0x0000_000b,
  SHA_512_224 = 0x0000_000c,
  SHA_512_256 = 0x0000_000d,
  SHA3_224 = 0x0000_000e,
  SHA3_256 = 0x0000_000f,
  SHA3_384 = 0x0000_0010,
  SHA3_512 = 0x0000_0011,
}

export enum KeyRoleType {
  BDK = 0x0000_0001,
  CVK = 0x0000_0002,
  DEK = 0x0000_0003,
  MKAC = 0x0000_0004,
  MKSMC = 0x0000_0005,
  MKSMI = 0x0000_0006,
  MKDAC = 0x0000_0007,
  MKDN = 0x0000_0008,
  MKCP = 0x0000_0009,
  MKOTH = 0x0000_000a,
  KEK = 0x0000_000b,
  MAC16609 = 0x0000_000c,
  MAC97971 = 0x0000_000d,
  MAC97972 = 0x0000_000e,
  MAC97973 = 0x0000_000f,
  MAC97974 = 0x0000_0010,
  MAC97975 = 0x0000_0011,
  ZPK = 0x0000_0012,
  PVKIBM = 0x0000_0013,
  PVKPVV = 0x0000_0014,
  PVKOTH = 0x0000_0015,
  DUKPT = 0x0000_0016,
  IV = 0x0000_0017,
  TRKBK = 0x0000_0018,
}

export enum DigitalSignatureAlgorithm {
  MD2_with_RSA_Encryption = 0x0000_0001,
  MD5_with_RSA_Encryption = 0x0000_0002,
  SHA_1_with_RSA_Encryption = 0x0000_0003,
  SHA_224_with_RSA_Encryption = 0x0000_0004,
  SHA_256_with_RSA_Encryption = 0x0000_0005,
  SHA_384_with_RSA_Encryption = 0x0000_0006,
  SHA_512_with_RSA_Encryption = 0x0000_0007,
  RSASSA_PSS = 0x0000_0008,
  DSA_with_SHA_1 = 0x0000_0009,
  DSA_with_SHA224 = 0x0000_000a,
  DSA_with_SHA256 = 0x0000_000b,
  ECDSA_with_SHA_1 = 0x0000_000c,
  ECDSA_with_SHA224 = 0x0000_000d,
  ECDSA_with_SHA256 = 0x0000_000e,
  ECDSA_with_SHA384 = 0x0000_000f,
  ECDSA_with_SHA512 = 0x0000_0010,
  SHA3_256_with_RSA_Encryption = 0x0000_0011,
  SHA3_384_with_RSA_Encryption = 0x0000_0012,
  SHA3_512_with_RSA_Encryption = 0x0000_0013,
}

export enum MaskGenerator {
  MFG1 = 0x0000_0001,
}

export class CryptographicParameters {
  blockCipherMode: BlockCipherMode | null = null
  paddingMethod: PaddingMethod | null = null
  hashingAlgorithm: HashingAlgorithm | null = null
  keyRoleType: KeyRoleType | null = null
  fixedFieldLength: number | null = null
  digitalSignatureAlgorithm: DigitalSignatureAlgorithm | null = null
  cryptographicAlgorithm: CryptographicAlgorithm | null = null
  randomIv: Boolean | null = null
  ivLength: number | null = null
  tagLength: number | null = null
  invocationFieldLength: number | null = null
  counterLength: number | null = null
  initialCounterValue: number | null = null
  /// if omitted, defaults to the block size of the Mask Generator Hashing Algorithm
  /// Cosmian extension: In AES: used as the number of additional data at the end of the
  /// submitted data that become part of the MAC calculation. These additional data are removed
  /// from the encrypted data
  saltLength: number | null = null

  /// if omitted defaults to MGF1
  maskGenerator: MaskGenerator | null = null

  /// if omitted defaults to SHA-1
  maskGeneratorHashingAlgorithm: HashingAlgorithm | null = null

  pSource: Uint8Array | null = null
  trailerField: number | null = null
}
