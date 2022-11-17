import { KmsResponse } from "kms";
import { Object } from '../structs/objects'

export class GetResponse implements KmsResponse {
    uniqueIdentifier: string
    object: Object

    constructor(uniqueIdentifier: string, object: Object) {
        this.uniqueIdentifier = uniqueIdentifier
        this.object = object
    }
}