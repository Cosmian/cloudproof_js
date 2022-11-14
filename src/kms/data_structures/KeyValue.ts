import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { PlainTextKeyValue } from "./PlainTextKeyValue"

/**
 * The Key Value is used only inside a Key Block and is either a Byte String or
 * a:
 *
 * • The Key Value structure contains the key material, either as a byte string
 * or as a Transparent Key structure, and OPTIONAL attribute information that is
 * associated and encapsulated with the key material. This attribute information
 * differs from the attributes associated with Managed Objects, and is obtained
 * via the Get Attributes operation, only by the fact that it is encapsulated
 * with (and possibly wrapped with) the key material itself.
 *
 * • The Key Value Byte String is either the wrapped TTLV-encoded Key Value
 * structure, or the wrapped un-encoded value of the Byte String Key Material
 * field.
 */
export class KeyValue {
  @metadata({
    name: "KeyValue",
    type: TtlvType.ByteString,
  })
  private _bytes?: Uint8Array | undefined

  public get bytes(): Uint8Array | undefined {
    return this._bytes
  }

  public set bytes(value: Uint8Array | undefined) {
    this._bytes = value
  }

  @metadata({
    name: "KeyValue",
    type: TtlvType.Structure,
    classOrEnum: PlainTextKeyValue,
  })
  private _plaintext?: PlainTextKeyValue | undefined

  public get plaintext(): PlainTextKeyValue | undefined {
    return this._plaintext
  }

  public set plaintext(value: PlainTextKeyValue | undefined) {
    this._plaintext = value
  }

  constructor(
    bytes?: Uint8Array | undefined,
    plaintext?: PlainTextKeyValue | undefined,
  ) {
    this._bytes = bytes
    this._plaintext = plaintext
  }

  public equals(o: object): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof KeyValue)) {
      return false
    }
    const instance = o
    return (
      this.bytes === instance._bytes && this.plaintext === instance._plaintext
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
