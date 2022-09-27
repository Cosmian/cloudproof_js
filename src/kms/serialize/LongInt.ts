export class LongInt {
  private _bytes: number;

  constructor(value: Uint8Array[8]) {
    this._bytes = value;
  }

  public get bytes(): Uint8Array[8] {
    return this._bytes;
  }

  public set bytes(value: Uint8Array[8]) {
    this._bytes = value;
  }
}
