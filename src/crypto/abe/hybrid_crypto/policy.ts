
const MAX_ATTRIBUTE_VALUE: number = 2 ^ 32 - 1


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