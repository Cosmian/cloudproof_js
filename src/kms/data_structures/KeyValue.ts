import { PlainTextKeyValue } from './PlainTextKeyValue'
import { KmipChoiceKeyMaterial } from '../json/KmipChoiceKeyMaterial'

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
export class KeyValue extends KmipChoiceKeyMaterial<Uint8Array, PlainTextKeyValue> {
  constructor (value1?: Uint8Array, value2?: PlainTextKeyValue) {
    super(value1, value2)
  }

  public equals (o: any): boolean {
    return super.equals(o)
  }

  public toString (): string {
    return super.toString()
  }
}
