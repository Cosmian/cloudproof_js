import { webassembly_rotate_attributes } from "../../../../../wasm_lib/abe/cover_crypt/cover_crypt"
import { hexDecode } from "../../../../lib"
import { Attribute, Policy } from "../../policy"



export class CoverCryptPolicy extends Policy {



    constructor(maxAttributeValue?: number) {
        super(maxAttributeValue)
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
        policy.last_attribute_value = this.lastAttributeValue
        policy.max_attribute_value = this.maxAttributeValue
        policy.store = this.store
        policy.attribute_to_int = this.attributeToInt
        return new TextEncoder().encode(JSON.stringify(policy))
    }

    /**
     * Deserialize a JSON encoded (as UTF-8 bytes) back to a Policy
     * @param policyEncoded 
     * @returns the policy
     */
    protected fromJsonEncoded(policyEncoded: Uint8Array): this {
        const policyJson = JSON.parse(new TextDecoder().decode(policyEncoded))
        this._maxAttributeValue = policyJson.maxAttributeValue
        this._attributeToInt = policyJson.attribute_to_int
        this._lastAttributeValue = policyJson.last_attribute_value
        this._store = policyJson.store
        return this
    }
    public rotate(attributes: Attribute[]): void {
        const policyBytes = this.toJsonEncoded()
        const attributesBytes = new TextEncoder().encode(JSON.stringify(attributes))
        const newPolicyString = webassembly_rotate_attributes(attributesBytes, policyBytes)
        this.fromJsonEncoded(new TextEncoder().encode(newPolicyString))
    }

    public static fromJsonEncoded(policyEncoded: Uint8Array): Policy {
        const policy = new CoverCryptPolicy()
        return policy.fromJsonEncoded(policyEncoded)
    }
}
