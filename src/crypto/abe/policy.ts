/* tslint:disable:max-classes-per-file */
export const MAX_ATTRIBUTE_VALUE: number = 2 ^ 32 - 1


export class Attribute {
    private axis: string
    private name: string

    /**
     *
     */
    constructor(axis: string, name: string) {
        this.axis = axis
        this.name = name
    }

    public toString(): string {
        return this.axis + '::' + this.name
    }

    public static parse(fullName: string): Attribute {
        const parts: string[] = fullName.split('::')
        if (parts.length !== 2) {
            throw new Error("invalid attribute: " + fullName)
        }
        const axis: string = parts[0].trim()
        if (axis.length === 0) {
            throw new Error("invalid axis in attribute: " + fullName)
        }
        const name: string = parts[1].trim()
        if (name.length === 0) {
            throw new Error("invalid name in attribute: " + fullName)
        }
        return new Attribute(axis, name)
    }
}


export abstract class Policy {
    protected _store: { [axis: string]: [string[], boolean] }

    protected _maxAttributeValue: number

    protected _lastAttributeValue: number

    protected _attributeToInt: { [attribute: string]: number[] }


    public get maxAttributeValue(): number {
        return this._maxAttributeValue
    }

    public get store(): { [axis: string]: [string[], boolean] } {
        return this._store
    }

    public get lastAttributeValue(): number {
        return this._lastAttributeValue
    }

    public get attributeToInt(): { [attribute: string]: number[] } {
        return this._attributeToInt
    }



    constructor(maxAttributeValue?: number) {
        if (typeof maxAttributeValue === 'undefined' || maxAttributeValue > MAX_ATTRIBUTE_VALUE) {
            this._maxAttributeValue = MAX_ATTRIBUTE_VALUE
        } else {
            this._maxAttributeValue = maxAttributeValue
        }
        this._lastAttributeValue = 0
        this._store = {}
        this._attributeToInt = {}
    }

    public addAxis(axis: string, attributeNames: string[], hierarchical?: boolean): this {
        //TODO: check if empty and existing axis ?
        this.store[axis] = [attributeNames, hierarchical || false]
        for (let name of attributeNames) {
            const attribute = new Attribute(axis, name)
            this.attributeToInt[attribute.toString()] = [this.lastAttributeValue]
            this._lastAttributeValue += 1
        }
        return this
    }

    /**
     * Serialize the Policy to a format appropriate for the underlying scheme
     */
    public abstract toJsonEncoded(): Uint8Array

    /**
     * Deserialize the bytes back to a Policy
     * @param policyEncoded 
     * @returns the policy
     */
    protected abstract fromJsonEncoded(policyEncoded: Uint8Array): this

    public abstract rotate(attributes: Attribute[]): void

}
