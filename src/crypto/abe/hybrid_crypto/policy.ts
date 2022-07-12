


export class Policy {
    private lastAttributeValue: number
    private maxAttributeValue: number

    private store: { [axis: string]: { names: string[], hierarchical: boolean } }

    private attributeToInt: { [attribute: string]: number[] }


    /**
     *
     */
    constructor(maxAttributeValue?: number) {
        if (typeof maxAttributeValue === 'undefined' || maxAttributeValue > MAX_ATTRIBUTE_VALUE) {
            this.maxAttributeValue = MAX_ATTRIBUTE_VALUE
        } else {
            this.maxAttributeValue = maxAttributeValue
        }
        this.lastAttributeValue = 0
        this.store = {}
        this.attributeToInt = {}
    }

    public addAxis(axis: string, attributeNames: string[], hierarchical?: boolean): this {
        //TODO: check if empty and existing axis ?
        this.store[axis] = { names: attributeNames, hierarchical: hierarchical || false }
        for (let name of attributeNames) {
            const attribute = new Attribute(axis, name)
            this.attributeToInt[attribute.toString()] = [this.lastAttributeValue]
            this.lastAttributeValue += 1
        }
        return this
    }

    public toBytes(): Uint8Array {
        return new TextEncoder().encode(JSON.stringify(this))
    }
}