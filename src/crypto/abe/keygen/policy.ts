/* tslint:disable:max-classes-per-file */
import { logger } from "../../../utils/logger"

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

export class PolicyAxis {
    private _name: string
    private _attributes: string[]
    private _hierarchical: boolean

    // Getters and setters
    public get attributes(): string[] {
        return this._attributes
    }
    public set attributes(value: string[]) {
        this._attributes = value
    }
    public get name(): string {
        return this._name
    }
    public set name(value: string) {
        this._name = value
    }
    public get hierarchical(): boolean {
        return this._hierarchical
    }
    public set hierarchical(value: boolean) {
        this._hierarchical = value
    }

    // Constructor
    constructor(name: string, attributes: string[], hierarchical: boolean) {
        this._name = name
        this._attributes = attributes
        this._hierarchical = hierarchical
    }
}

export class Policy {
    private store: { [axis: string]: { names: string[], hierarchical: boolean } }
    private maxAttributeValue: number
    private lastAttributeValue: number
    private attributeToInt: { [attribute: string]: number[] }


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

    // Convert this `Policy` to JSON. Output example:
    // {
    //     "last_attribute_value": 10,
    //     "max_attribute_value": 100,
    //     "store": {
    //         "Security Level": [
    //         [
    //             "Protected",
    //             "Low Secret",
    //             "Medium Secret",
    //             "High Secret",
    //             "Top Secret"
    //         ],
    //         true
    //         ],
    //         "Department": [
    //         [
    //             "R&D",
    //             "HR",
    //             "MKG",
    //             "FIN"
    //         ],
    //         false
    //         ]
    //     },
    //     "attribute_to_int": {
    //         "Security Level::Low Secret": [
    //         2
    //         ],
    //         "Department::MKG": [
    //         8
    //         ],
    //         "Security Level::Medium Secret": [
    //         3
    //         ],
    //         "Security Level::Top Secret": [
    //         5
    //         ],
    //         "Security Level::Protected": [
    //         1
    //         ],
    //         "Department::FIN": [
    //         10,
    //         9
    //         ],
    //         "Department::HR": [
    //         7
    //         ],
    //         "Department::R&D": [
    //         6
    //         ],
    //         "Security Level::High Secret": [
    //         4
    //         ]
    //     } 
    // }
    public toJsonEncoded(): Uint8Array {
        const policy: any = {}
        policy.store = {}
        policy.attribute_to_int = {}
        if (this.lastAttributeValue === undefined && this.lastAttributeValue === undefined) {
            let attributeNb = 1
            this.axes.forEach((axis: PolicyAxis) => {
                policy.store[axis.name] = [axis.attributes, axis.hierarchical]
                axis.attributes.forEach((attr: string) => {
                    policy.attribute_to_int[new Attribute(axis.name, attr).toString()] = [attributeNb]
                    attributeNb++
                })
            })
            policy.last_attribute_value = attributeNb

        } else {
            policy.last_attribute_value = this.lastAttributeValue
            policy.attribute_to_int = this.attributeToInt
            this.axes.forEach((axis: PolicyAxis) => {
                policy.store[axis.name] = [axis.attributes, axis.hierarchical]
            })
        }
        policy.max_attribute_value = this.maxAttributeValue
        return new TextEncoder().encode(JSON.stringify(policy))
    }

    public static fromJsonEncoded(policy: string): Policy {
        logger.log(() => "policy: " + policy)
        const policyJson = JSON.parse(policy)

        // Fill Policy Axis
        const axes: PolicyAxis[] = []
        for (const name of Object.keys(policyJson.store)) {
            const value = policyJson.store[name]
            axes.push(new PolicyAxis(name, value[0], value[1]))
        }
        return new Policy(axes,
            policyJson.max_attribute_value,
            policyJson.last_attribute_value,
            policyJson.attribute_to_int)
    }
}
