/**
 * Copyright Cosmian 2021 -
 */

import { ReadableStream, WritableStream, ReadableStreamAsyncIterator, ReadableStreamBYOBReader, ReadableStreamDefaultReader, ReadableStreamIteratorOptions, ReadableWritablePair, StreamPipeOptions } from "web-streams-polyfill"
import { logger } from "../../utils/logger"
import { fromBeBytes } from "../../utils/utils"


export class EncryptedFileReader extends ReadableStream<Uint8Array>{

    /**
     *
     */
    constructor(blob: Blob | File) {
        super(new BlobUnderlyingSource(blob))

    }
}

class BlobUnderlyingSource implements UnderlyingSource {

    blob: Blob | File
    bytesRead: number

    constructor(blob: Blob | File) {
        this.blob = blob
        this.bytesRead = 0
    }

    start(controller: ReadableStreamController<any>): void {
        logger.log(() => "encrypted reader: start")
        // we run all in start to avoid concurrent issues in pull
        this.readAllByChunks(controller)
    }
    pull(controller: ReadableStreamController<any>): void | PromiseLike<void> {



    }
    cancel(reason: any): void {
        logger.log(() => "Canceled call on underlying stream: " + reason)
    }


    readAllByChunks(controller: ReadableStreamController<any>): void | PromiseLike<void> {

        if (this.bytesRead >= this.blob.size) {
            // EOF
            logger.log(() => "encrypted reader: EOF")
            controller.close()
            return
        } else {
            logger.log(() => "encrypted reader: read " + this.bytesRead + " bytes out of " + this.blob.size)
        }

        const start = this.bytesRead
        var sizeReader = new FileReader()

        sizeReader.onload = (event: ProgressEvent<FileReader>): any => {
            if (event.target?.error !== null) {
                controller.error("Failed reading size of the next chunk")
                controller.close()
                return
            }

            const sizeBytes = new Uint8Array(event.target?.result as ArrayBuffer)
            const chunkSize = fromBeBytes(sizeBytes)
            logger.log(() => "encrypted reader: chunk size is " + chunkSize + " bytes")
            var chunkReader = new FileReader()
            chunkReader.onload = (event: ProgressEvent<FileReader>): any => {
                if (event.target?.error !== null) {
                    controller.error("Failed reading size of the next chunk")
                    controller.close()
                    return
                }
                const chunkBytes = new Uint8Array(event.target?.result as ArrayBuffer)
                this.bytesRead += 4 + chunkSize
                controller.enqueue(chunkBytes)

                this.readAllByChunks(controller)
            }
            // trigger read of the chunk
            var chunkBlob = this.blob.slice(start + 4, start + chunkSize)
            chunkReader.readAsArrayBuffer(chunkBlob)
        }

        // trigger read of the size of the next chunk
        var sizeBlob = this.blob.slice(start, start + 4)
        sizeReader.readAsArrayBuffer(sizeBlob)

    }

}