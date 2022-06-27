/* tslint:disable:max-classes-per-file */
import { Policy } from "./policy"


export class AbeMasterKey {
  private _privateKey: Uint8Array
  private _publicKey: Uint8Array

  // Getters and setters
  public get privateKey(): Uint8Array {
    return this._privateKey
  }
  public set privateKey(value: Uint8Array) {
    this._privateKey = value
  }
  public get publicKey(): Uint8Array {
    return this._publicKey
  }
  public set publicKey(value: Uint8Array) {
    this._publicKey = value
  }

  // Constructor
  constructor(privateKey: Uint8Array, publicKey: Uint8Array) {
    this._privateKey = privateKey
    this._publicKey = publicKey
  }
}


export abstract class AbeKeyGeneration {
  public abstract generateMasterKey(policy: Policy): AbeMasterKey
  public abstract generateUserPrivateKey(privateKey: Uint8Array, accessPolicy: string, policy: Policy): Uint8Array
  public abstract rotateAttributes(attributes: string[], policy: Policy): Policy

}
