import { TtlvType } from "../serialize/TtlvType"

export interface ISinglePropertyMetadata {
    name: string
    type: TtlvType
    isEnum?: Object
}

export const METADATA_KEY = Symbol("propertyMetadata")
