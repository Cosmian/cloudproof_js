// import { EncryptionParameters } from "crypto/abe/interfaces/encryption_parameters";
import { Metadata } from './metadata'

export const SYMMETRIC_KEY_SIZE = 32

export class AbeEncryptionParameters {
  // ABE attributes as a string: for example: ["Department::FIN" , "Security Level::Confidential"]
  private _attributes: string[]
  // Metadata used to save integrity parameter and additional data
  private _metadata: Metadata

  constructor (attributes: string[], metadata: Metadata) {
    this._attributes = attributes
    this._metadata = metadata
  }

  public get attributes (): string[] {
    return this._attributes
  }

  public set attributes (value: string[]) {
    this._attributes = value
  }

  public get metadata (): Metadata {
    return this._metadata
  }

  public set metadata (value: Metadata) {
    this._metadata = value
  }
}
