import { Certificate } from "crypto"
import { KmipObject } from "kms/objects/KmipObject"
import { SymmetricKey } from "kms/objects/SymmetricKey"
import { Get } from "kms/operations/Get"
import { GetResponse } from "kms/operations/GetResponse"
import { fromTTLV } from "../deserialize/deserializer"
import { Create } from "../operations/Create"
import { CreateResponse } from "../operations/CreateResponse"
import { toTTLV } from "../serialize/serializer"
import { Attributes } from "../types/Attributes"
import { CryptographicAlgorithm } from "../types/CryptographicAlgorithm"
import { KeyFormatType } from "../types/KeyFormatType"
import { Link } from "../types/Link"
import { ObjectType } from "../types/ObjectType"

export class KmipClient {

    private readonly url: URL

    private readonly headers: HeadersInit


    /**
     * Instantiate a KMS Client
     * 
     * @param {URL} url of the KMS server
     * @param {string} apiKey optional, to authenticate to the KMS server
     */
    constructor(url: URL, apiKey?: string) {
        this.url = url
        this.headers = {
            "Content-Type": "application/json; charset=utf-8",
        }
        if (typeof apiKey !== "undefined") {
            this.headers = Object.assign(this.headers, { "Authorization": `Bearer ${apiKey}` })
        }
    }

    /**
     * Execute a KMIP request and get a response
     * It is easier and safer to use the specialized methods of this class, for each crypto system 
     * 
     * @param {object} payload a valid KMIP operation
     * @param {Function} responseClass the class of the expected KMIP response
     * @returns {object} an instance of the KMIP response
     */
    public async post<P extends Object, R extends Object>(payload: P, responseClass: new (...args: any[]) => R): Promise<R> {
        const ttlv = toTTLV(payload)
        const options: RequestInit = {
            method: "POST",
            body: JSON.stringify(ttlv),
            headers: this.headers
        }
        const response = await fetch(this.url, options)
        if (response.status >= 400) {
            throw new Error(`KMIP request failed: ${await response.text()}`)
        }
        const content = await response.json()
        console.log("CONTENT", content)
        return fromTTLV(responseClass, content)
    }

    /**
     * Tests whether the KMS server is responding 
     * 
     * @returns {boolean} true if up
     */
    public async up(): Promise<boolean> {
        const options: RequestInit = {
            method: "GET",
            headers: this.headers
        }
        try {
            await fetch(this.url, options)
            return true
        } catch (error) {
            return false
        }
    }

    public async aesGcmCreateSymmetricKey(algorithm: SymmetricKeyAlgorithm, bits: number, links?: Link[]): Promise<string> {
        let algo = CryptographicAlgorithm.AES
        if (algorithm === SymmetricKeyAlgorithm.AES_GCM) {
            algo = CryptographicAlgorithm.AES
        }
        const create = new Create(
            ObjectType.SymmetricKey,
            new Attributes(
                ObjectType.SymmetricKey,
                links,
                undefined,
                undefined,
                algo,
                256,
                undefined,
                undefined,
                undefined,
                KeyFormatType.TransparentSymmetricKey
            )
        )
        const response = await this.post(create, CreateResponse)
        return response.uniqueIdentifier
    }


    public async getObject<T extends KmipObject>(objectType: typeof Certificate | typeof SymmetricKey, uniqueIdentifier: string): Promise<T> {
        const get = new Get(uniqueIdentifier)
        const response = await this.post(get, GetResponse)
        console.log("RESPONSE", response)
        if (objectType === Certificate && response.objectType === ObjectType.Certificate) {
            return response.object as T
        }
        if (objectType === SymmetricKey && response.objectType === ObjectType.SymmetricKey) {
            return response.object as T
        }
        throw new Error(`GET failed: expected a ${objectType.name}, got a ${response.objectType}`)
    }



}

export enum SymmetricKeyAlgorithm {
    AES_GCM
}

