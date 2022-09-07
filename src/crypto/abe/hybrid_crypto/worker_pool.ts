import { logger } from "../../../utils/logger"
import { DecryptionWorkerMessage } from "./interfaces/decryption"


export type EncryptedEntry = { uidHex: string, ciphertextHex: string }

export class WorkerPool {

    workers: Worker[]

    /**
     * Instantiate a pool of workers
     * @param numWorkers
     */
    constructor(numWorkers: number) {
        if (numWorkers <= 0) {
            throw new Error("Invalid number of workers: " + numWorkers)
        }
        this.workers = []
        for (let index = 0; index < numWorkers; index++) {
            // !! webpack wants this on a single line; do not split
            const worker = new Worker(new URL('./worker.ts', import.meta.url))
            this.workers.push(worker)
        }
    }

    /**
     * Attempt decryption of the selected entries using an user decryption key
     * @param decryptionKeyHex
     * @param encryptedEntries
     * @param isGpswImplementation
     * @returns an array of the results that could be decrypted
     */
    public async decrypt(decryptionKeyHex: string, encryptedEntries: EncryptedEntry[], isGpswImplementation: boolean): Promise<Uint8Array[]> {
        return runWorkers(this.workers, decryptionKeyHex, encryptedEntries, isGpswImplementation)
    }

    /**
     * Terminate all workers
     * Tis pool is no more usable
     */
    public terminate() {
        this.workers.forEach((w) => w.terminate())
    }
}

/**
 * Attempt decryption of the selected entries using an user decryption key
 * @param decryptionKeyHex
 * @param encryptedEntries
 * @returns an array of the results that could be decrypted
 */
export async function runWorkers(workers: Worker[], decryptionKeyHex: string, encryptedEntries: EncryptedEntry[], isGpswImplementation: boolean): Promise<Uint8Array[]> {
    logger.log(() => "NUM WORKERS: " + workers.length)
    if (workers.length === 1) {
        // let us kep this simple then
        return await runWorker(workers[0], decryptionKeyHex, encryptedEntries, isGpswImplementation)
    }
    // split the entries among workers
    const perWorker = encryptedEntries.length / workers.length
    let promises: Promise<Uint8Array[]>[] = []
    for (let index = 0; index < workers.length; index++) {
        let entries: EncryptedEntry[]
        if (index == workers.length - 1) {
            // the last worker needs the division remainder as well
            entries = encryptedEntries.slice(index * perWorker)
        } else {
            entries = encryptedEntries.slice(index * perWorker, (index + 1) * perWorker)
        }
        promises.push(runWorker(workers[index], decryptionKeyHex, entries, isGpswImplementation))
    }
    // wait for all workers to complete
    let results = await Promise.all(promises)
    // flatten the results
    return results.flat()
}


const runWorker = (worker: Worker, decryptionKeyHex: string, encryptedEntries: EncryptedEntry[], isGpswImplementation: boolean): Promise<Uint8Array[]> => {

    // Transform asynchronous messaging wih callback into a Future
    return new Promise((resolve: (value: Uint8Array[] | PromiseLike<Uint8Array[]>) => void, reject: (reason?: any) => void) => {

        // a temporary cache for the asynchronous calls
        let err: string | undefined
        let result: Uint8Array[]

        // This handles the message communication and workflow with the worker
        worker.onmessage = (event) => {
            const msg = event.data as DecryptionWorkerMessage
            const msgName = msg.name
            const value = msg.value
            const error = msg.error

            if (msgName === "INIT") {
                if (typeof error !== "undefined") {
                    return reject("ERROR: " + error)
                }
                // launch decryption
                worker.postMessage({
                    name: "DECRYPT",
                    value: encryptedEntries
                })

            } else if (msgName === "DECRYPT") {
                if (typeof error !== "undefined") {
                    err = "ERROR: " + error
                } else {
                    result = value
                }

                // done decrypting, destroy encryption cache
                worker.postMessage({
                    name: "DESTROY",
                    value: ""
                })

            } else if (msgName === "DESTROY") {
                if (typeof error !== "undefined") {
                    reject("ERROR: " + error)
                } else {
                    if (typeof err === "undefined") {
                        resolve(result)
                    } else {
                        reject(err)
                    }
                }

                // done

            } else {
                reject("UNKNOWN RESPONSE: " + msgName)
            }
        }

        worker.onerror = (event: ErrorEvent) => {
            reject("WORKER ERROR: " + event.message)
        }

        // let us get started
        worker.postMessage({
            name: "INIT",
            value: decryptionKeyHex,
            isGpswImplementation
        } as DecryptionWorkerMessage)
        logger.log(() => "run worker ")

    })
}
