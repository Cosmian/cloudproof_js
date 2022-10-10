export enum TtlvType {
  Structure = "Structure",

  /**
   * An array of Structures
   * Does not exist as original TTLV
   * Added to support array deserialization
   */
  StructuresArray = "StructuresArray",

  Integer = "Integer",
  LongInteger = "LongInteger",
  BigInteger = "BigInteger",
  Enumeration = "Enumeration",
  Boolean = "Boolean",
  TextString = "TextString",
  ByteString = "ByteString",
  DateTime = "DateTime",
  Interval = "Interval",
  DateTimeExtended = "DateTimeExtended",

  // a type added to support polymorphism
  // where a TTLV value can take a list of multiple types
  Choice = "Choice",
}
