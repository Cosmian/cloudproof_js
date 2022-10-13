import { TransparentDHPrivateKey } from "./TransparentDHPrivateKey"
import { TransparentDHPublicKey } from "./TransparentDHPublicKey"
import { TransparentECPrivateKey } from "./TransparentECPrivateKey"
import { TransparentECPublicKey } from "./TransparentECPublicKey"
import { TransparentSymmetricKey } from "./TransparentSymmetricKey"


// Byte String: for Raw, Opaque, PKCS1, PKCS8, ECPrivateKey, or Extension Key Format types
// Structure: for Transparent, or Extension Key Format Types

// TODO Implement missing TransparentDSAPrivateKey, TransparentDSAPublicKey,
export class KeyMaterial {


  private _bytes?: Uint8Array | undefined

  public get bytes(): Uint8Array | undefined {
    return this._bytes
  }

  public set bytes(value: Uint8Array | undefined) {
    this._bytes = value
  }

  private _transparentDHPrivateKey?: TransparentDHPrivateKey | undefined

  public get transparentDHPrivateKey(): TransparentDHPrivateKey | undefined {
    return this._transparentDHPrivateKey
  }

  public set transparentDHPrivateKey(value: TransparentDHPrivateKey | undefined) {
    this._transparentDHPrivateKey = value
  }

  private _transparentDHPublicKey?: TransparentDHPublicKey | undefined

  public get transparentDHPublicKey(): TransparentDHPublicKey | undefined {
    return this._transparentDHPublicKey
  }

  public set transparentDHPublicKey(value: TransparentDHPublicKey | undefined) {
    this._transparentDHPublicKey = value
  }

  private _transparentECPrivateKey?: TransparentECPrivateKey | undefined

  public get transparentECPrivateKey(): TransparentECPrivateKey | undefined {
    return this._transparentECPrivateKey
  }

  public set transparentECPrivateKey(value: TransparentECPrivateKey | undefined) {
    this._transparentECPrivateKey = value
  }

  private _transparentECPublicKey?: TransparentECPublicKey | undefined
  public get transparentECPublicKey(): TransparentECPublicKey | undefined {
    return this._transparentECPublicKey
  }

  public set transparentECPublicKey(value: TransparentECPublicKey | undefined) {
    this._transparentECPublicKey = value
  }

  private _transparentSymmetricKey?: TransparentSymmetricKey | undefined

  public get transparentSymmetricKey(): TransparentSymmetricKey | undefined {
    return this._transparentSymmetricKey
  }

  public set transparentSymmetricKey(value: TransparentSymmetricKey | undefined) {
    this._transparentSymmetricKey = value
  }


  constructor(keyBytes?: Uint8Array,
    transparentDHPrivateKey?: TransparentDHPrivateKey,
    transparentDHPublicKey?: TransparentDHPublicKey,
    transparentECPrivateKey?: TransparentECPrivateKey,
    transparentECPublicKey?: TransparentECPublicKey,
    transparentSymmetricKey?: TransparentSymmetricKey) {
    this._bytes = keyBytes
    this._transparentDHPrivateKey = transparentDHPrivateKey
    this._transparentDHPublicKey = transparentDHPublicKey
    this._transparentECPrivateKey = transparentECPrivateKey
    this._transparentECPublicKey = transparentECPublicKey
    this._transparentSymmetricKey = transparentSymmetricKey
  }


  // public equals(o: any): boolean {
  //   return super.equals(o)
  // }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }

}
