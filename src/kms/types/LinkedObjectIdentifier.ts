import { KmipChoiceLinkedObjectIdentifier } from "../json/KmipChoiceLinkedObjectIdentifier";
import { UniqueIdentifier } from "./UniqueIdentifier";

/**
 * Either:
 * 
 * - String : Unique Identifier of a Managed Object
 * 
 * - Enumeration: Zero based nth Unique Identifier in the response. If negative
 * the count is backwards from the beginning of the current operation’s batch
 * item.
 * 
 * - Integer: Index
 */
export class LinkedObjectIdentifier extends KmipChoiceLinkedObjectIdentifier<string, number, UniqueIdentifier> {

    constructor (value1?: string, value2?: number, value3?: UniqueIdentifier) {
        super(value1, value2, value3);
    }

    public equals(o: any): boolean {
        return super.equals(o)
    }

    public toString(): string {
        return super.toString()
    }

}
