export class DateTimeExtended {
  private _extendedDate: string

  constructor (value: string) {
    this._extendedDate = value
  }

  public get extendedDate (): string {
    return this._extendedDate
  }

  public set extendedDate (value: string) {
    this._extendedDate = value
  }
}
