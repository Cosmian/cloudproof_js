import { KmipChoiceKey } from '../json/KmipChoiceKey'
import { TransparentDHPrivateKey } from './TransparentDHPrivateKey'
import { TransparentDHPublicKey } from './TransparentDHPublicKey'
import { TransparentECPrivateKey } from './TransparentECPrivateKey'
import { TransparentECPublicKey } from './TransparentECPublicKey'
import { TransparentSymmetricKey } from './TransparentSymmetricKey'

// TODO Implement missing TransparentDSAPrivateKey, TransparentDSAPublicKey,
export class KeyMaterial extends KmipChoiceKey<Uint8Array, TransparentSymmetricKey, TransparentDHPrivateKey, TransparentDHPublicKey, TransparentECPrivateKey, TransparentECPublicKey> {
  constructor (value1?: Uint8Array, value2?: TransparentSymmetricKey, value3?: TransparentDHPrivateKey, value4?: TransparentDHPublicKey, value5?: TransparentECPrivateKey, value6?: TransparentECPublicKey) {
    super(value1, value2, value3, value4, value5, value6)
  }

  public equals (o: any): boolean {
    return super.equals(o)
  }

  public toString (): string {
    return super.toString()
  }
}
