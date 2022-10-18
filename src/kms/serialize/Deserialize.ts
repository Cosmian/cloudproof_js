import { TTLV } from "./Ttlv"

/**
 * Implemented by a KMIP Object which has a custom serialization procedure
 */
export interface Serialize {
  toTTLV: (propertyName?: string) => TTLV
}
