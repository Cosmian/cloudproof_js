/* tslint:disable:max-classes-per-file */
import { logger } from "../../../utils/logger"

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
    private _axis: PolicyAxis[]
    private _revocationNumber: number

    constructor(axis: PolicyAxis[], revocationNumber: number) {
        this._axis = axis
        this._revocationNumber = revocationNumber
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
        policy.max_attribute_value = this._revocationNumber
        policy.store = {}
        policy.attribute_to_int = {}
        let attributeNb = 1
        this._axis.forEach((axis: PolicyAxis) => {
            policy.store[axis.name] = [axis.attributes, axis.hierarchical]
            axis.attributes.forEach((attr: string) => {
                policy.attribute_to_int[axis.name + "::" + attr] = [attributeNb]
                attributeNb++;
            })
        })
        policy.last_attribute_value = attributeNb
        // TODO(ecse): differences between GPSW and CoverCrypt policies
        policy.last_attribute = attributeNb
        policy.max_attribute = this._revocationNumber

        logger.log(() => "policy (JSON)" + policy)
        const result = new TextEncoder().encode(JSON.stringify(policy))
        return result
    }

}
