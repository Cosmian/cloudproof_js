// ----------------------------------------------------
// Local files encryption and decryption
// ----------------------------------------------------

import { CoverCryptDemoKeys } from "../crypto/hybrid_crypto/abe/cover_crypt/demo_keys"
import { download, FileMetaData } from "../files/download/DownloadManager"
import { CoverCryptDecryptionTS } from "../files/transformers/CoverCryptDecryptionTS"
import { CoverCryptEncryptionTS } from "../files/transformers/CoverCryptEncryptionTS"
import { ClearTextFileReader } from "../files/upload/ClearTextFileReader"
import { EncryptedFileReader } from "../files/upload/EncryptedFileReader"



export async function encrypt_files(files: File[], securityLevel: string, department: string) {
    Promise.all(files.map(f => encrypt_file(f, securityLevel, department)))
}


export async function encrypt_file(file: File, securityLevel: string, department: string): Promise<void> {
    console.log("Encrypting....")
    console.log("....Name", file.name)
    console.log("....Type", file.type)
    console.log("....Size", file.size)
    console.log("....Security Level", securityLevel)
    console.log("....Department", department)


    // stream the clear text content from the file by block
    let clear_text_stream = new ClearTextFileReader(file, 1024 * 1024)
    // encrypt a stream of blocks
    let encryption_stream = new CoverCryptEncryptionTS(CoverCryptDemoKeys.publicKey, CoverCryptDemoKeys.policy, ['Security Level::' + securityLevel, 'Department::' + department], CoverCryptDemoKeys.uid)
    // let encryption_stream = new DoNothingTS()

    // save the encrypted content to disk
    const encrypted_file_meta_data = {
        uuid: "12345",
        filename: file.name + ".encrypted",
        mimeType: file.type,
    } as FileMetaData
    let encrypted_writable_stream = await download(encrypted_file_meta_data, () => {
        encryption_stream.writable.abort("download canceled")
        console.log("download canceled")
    })
    // connect all the streams and make the magic happen
    await Promise.all([
        clear_text_stream.pipeTo(encryption_stream.writable),
        encryption_stream.readable.pipeTo(encrypted_writable_stream)
    ])
}



export async function decrypt_files(files: File[], userKey: string): Promise<void> {
    try {
        await Promise.all(files.map(f => decrypt_file(f, userKey)))
    } catch (error) {
        return Promise.reject(error)
    }
    return Promise.resolve()
}

export async function decrypt_file(file: File, userKey: string): Promise<void> {
    console.log("Decrypting....")
    console.log("....Name", file.name)
    console.log("....Type", file.type)
    console.log("....Size", file.size)
    console.log("....User Key", userKey)

    let userKeyBin: Uint8Array
    if (userKey === "topSecretMkgFinUser") {
        userKeyBin = CoverCryptDemoKeys.topSecretMkgFinUser
    } else if (userKey === "mediumSecretMarketingUser") {
        userKeyBin = CoverCryptDemoKeys.mediumSecretMkgUser
    } else {
        return Promise.reject("Unknown key")
    }

    try {

        // stream the encrypted content from the file by block
        let encrypted_stream = new EncryptedFileReader(file)
        // decrypt a stream of blocks
        let decryption_stream = new CoverCryptDecryptionTS(userKeyBin, CoverCryptDemoKeys.uid)
        // save the clear text content to disk
        const decrypted_file_meta_data = {
            uuid: "12345",
            filename: file.name + ".decrypted",
            mimeType: file.type,
        } as FileMetaData
        let decrypted_writable_stream = await download(decrypted_file_meta_data, () => {
            console.log("download canceled")
            encrypted_stream.cancel("download canceled")
        })
        // connect all the streams and make the magic happen
        await Promise.all([
            encrypted_stream.pipeTo(decryption_stream.writable),
            decryption_stream.readable.pipeTo(decrypted_writable_stream)
        ])

    } catch (error) {
        return Promise.reject(error)
    }

    return Promise.resolve()
}



console.log(JSON.parse(new TextDecoder().decode(CoverCryptDemoKeys.policy)))