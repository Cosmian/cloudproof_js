/**
 * the wrapped un-encoded value of the Byte String Key Material field
 */
export enum EncodingOption {

  /// the Key Value structure
  No_Encoding = 0x0000_0001,
  /// the wrapped TTLV-encoded Key Value structure
  TTLV_Encoding = 0x0000_0002,

}
