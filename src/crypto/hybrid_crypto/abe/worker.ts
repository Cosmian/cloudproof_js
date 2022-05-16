import { HybridDecryption, AbeHybridDecryption, DecryptionWorkerMessage, ClearTextHeader } from "./gpsw/abe_decryption"
import { hexDecode } from "./../../../utils/utils"
import { logger } from "./../../../utils/logger"

const ctx: Worker = self as any

class DecryptWorker {

    hybridDecryption: HybridDecryption | null = null

    init(asymmetricDecryptionKey: string) {
        this.hybridDecryption = new AbeHybridDecryption(hexDecode(asymmetricDecryptionKey))

    }
    /**
     * Destroy the hybrid decryption crypto
     */
    destroy() {
        if (this.hybridDecryption == null) {
            return
        }
        this.hybridDecryption.destroyInstance()
    }

    decrypt(encryptedEntries: { ciphertextHex: string }[]): Uint8Array[] {

        let dec: HybridDecryption
        if (this.hybridDecryption === null) {
            // TODO handle hybrid crypto not initialized here if needed
            throw new Error("The hybrid decrption scheme is not initalized")
        } else {
            dec = this.hybridDecryption
        }

        const cleartextValues: Uint8Array[] = []
        for (let index = 0; index < encryptedEntries.length; index++) {
            const { ciphertextHex } = encryptedEntries[index]

            // Hex decode (uid and value)
            const encryptedValue = hexDecode(ciphertextHex)

            // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
            const headerSize = dec.getHeaderSize(encryptedValue)
            const asymmetricHeader = encryptedValue.slice(4, 4 + headerSize)
            const encryptedSymmetricBytes = encryptedValue.slice(4 + headerSize, encryptedValue.length)

            // HEADER decryption: asymmetric decryption
            let cleartextHeader: ClearTextHeader
            try {
                cleartextHeader = dec.decryptHybridHeader(asymmetricHeader)
            } catch (error) {
                //TODO Handle additional ABE decryption errors if need be
                continue
            }

            // AES_DATA: AES Symmetric part decryption
            let cleartext: Uint8Array
            try {
                cleartext = dec.decryptHybridBlock(cleartextHeader.symmetricKey, encryptedSymmetricBytes, cleartextHeader.uid, 0)
            } catch (error) {
                //TODO Handle AES decryption errors if need be
                continue
            }
            cleartextValues.push(cleartext)

        }

        return cleartextValues
    }
}


const decrypter = new DecryptWorker()

ctx.onmessage = (event) => {
    const msg = event.data as DecryptionWorkerMessage
    const msgName = msg.name
    const input = msg.value

    if (msgName == "INIT") {
        decrypter.init(input as string)
        logger.log(() => "worker cache initialized")
        ctx.postMessage({
            name: "INIT",
            value: "SUCCESS"
        })
    } else if (msgName == "DECRYPT") {
        logger.log(() => "worker decrypting")
        ctx.postMessage({
            name: "DECRYPT",
            value: decrypter.decrypt(input)
        })
        logger.log(() => "... done decrypting")
    } else if (msgName == "DESTROY") {
        ctx.postMessage({
            name: "DESTROY",
            value: "SUCCESS"
        })
        logger.log(() => "worker cache destroyed")
    } else {
        ctx.postMessage({
            name: "ERROR",
            error: "Invalid message: " + msgName
        })
    }
}
