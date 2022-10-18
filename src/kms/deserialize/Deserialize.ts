import { TTLV } from "../serialize/Ttlv"

/**
 * Implemented by a KMIP Object which has a custom deserialization procedure
 */
export interface Deserialize {
  fromTTLV: (ttlv: TTLV, propertyName: string) => this
}
