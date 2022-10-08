import { TTLV } from "../serialize/Ttlv";
import { TtlvType } from "../serialize/TtlvType";

export interface PropertyMetadata {
  name: string;
  type: TtlvType;
  isEnum?: any;

  from_ttlv?: (propertyName: string, ttlv: TTLV) => Object;
}

export const METADATA_KEY = Symbol("propertyMetadata");
