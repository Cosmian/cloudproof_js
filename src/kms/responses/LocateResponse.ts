export class LocateResponse {
  uniqueIdentifier: string[] = []
  locatedItems: number | null = null

  constructor(
    uniqueIdentifier: string[] = [],
    locatedItems: number | null = null,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.locatedItems = locatedItems
  }
}
