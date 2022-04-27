export enum WrappingMethod {
  Encrypt = 0x0000_0001,
  MAC_sign = 0x0000_0002,
  Encrypt_then_MAC_sign = 0x0000_0003,
  MAC_sign_then_encrypt = 0x0000_0004,
  TR_31 = 0x0000_0005,
}
