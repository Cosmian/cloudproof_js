import { PropertyMetadata } from '../decorators/function'
import { TtlvType } from '../serialize/TtlvType'
import { Tag } from '../types/Tag'

export class KmipChoiceAttributeReference<C1, C2, C3> {
  @PropertyMetadata({
    name: 'AttributeReference',
    type: TtlvType.TextString
  })
  private _c1?: C1 | undefined

  @PropertyMetadata({
    name: 'AttributeReference',
    type: TtlvType.Structure
  })
  private _c2?: C2 | undefined

  @PropertyMetadata({
    name: 'AttributeReference',
    type: TtlvType.Enumeration,
    isEnum: Tag
  })
  private _c3?: C3 | undefined

  constructor (c1?: C1 | undefined, c2?: C2 | undefined, c3?: C3 | undefined) {
    this.c1 = c1
    this.c2 = c2
    this.c3 = c3
  }

  public get c1 (): C1 | undefined {
    return this._c1
  }

  public set c1 (value: C1 | undefined) {
    this._c1 = value
  }

  public get c2 (): C2 | undefined {
    return this._c2
  }

  public set c2 (value: C2 | undefined) {
    this._c2 = value
  }

  public get c3 (): C3 | undefined {
    return this._c3
  }

  public set c3 (value: C3 | undefined) {
    this._c3 = value
  }

  public equals (o: object): boolean {
    if (o == this) { return true }
    if (!(o instanceof KmipChoiceAttributeReference)) {
      return false
    }
    const kmipChoice = o
    return this.c1 === kmipChoice.c1 && this.c2 === kmipChoice.c2
  }

  public toString (): string {
    return '{' + " attribute_reference='" + (this.c1, this.c2, this.c3) + '}'
  }
}
