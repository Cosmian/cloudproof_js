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
