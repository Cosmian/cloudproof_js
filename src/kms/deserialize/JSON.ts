import { TTLV } from "../serialize/Ttlv";

export type TtlvValue = TTLV[] | number | string | Uint8Array | boolean | any;

export interface JsonObject {
  tag: string;
  type?: string;
  value: TtlvValue;
}
