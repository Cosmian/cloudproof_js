import { TTLV } from "kms/serialize/Ttlv"

/**
 * A deserializable KMIP Object has a custom deserialization procedure
 */
export interface Deserializable {
    fromTTLV: (ttlv: TTLV, propertyName?: string) => this
}