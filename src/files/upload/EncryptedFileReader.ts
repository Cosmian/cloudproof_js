<<<<<<< HEAD
=======

>>>>>>> 54f95b8 (re-importing from old repo)
/**
 * Copyright Cosmian 2021 -
 */

import { ReadableStream, WritableStream, ReadableStreamAsyncIterator, ReadableStreamBYOBReader, ReadableStreamDefaultReader, ReadableStreamIteratorOptions, ReadableWritablePair, StreamPipeOptions } from "web-streams-polyfill"
<<<<<<< HEAD
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
            logger.log(() => "encrypted reader: EOF; total bytes read: " + this.bytesRead)
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
            logger.log(() => "encrypted reader: encrypted chunk size is " + chunkSize + " bytes")
            var chunkReader = new FileReader()
            chunkReader.onload = (event: ProgressEvent<FileReader>): any => {
                if (event.target?.error !== null) {
                    controller.error("Failed reading size of the next chunk " + event.target?.error)
                    controller.close()
                    return
                }
                const chunkBytes = new Uint8Array(event.target?.result as ArrayBuffer)
                this.bytesRead += 4 + chunkSize
                try {
                    controller.enqueue(chunkBytes)
                } catch (error) {
                    const err = "the underlying stream is in error: " + error
                    controller.error(err)
                    controller.close()
                    return
                }

                this.readAllByChunks(controller)
            }
            // trigger read of the chunk
            var chunkBlob = this.blob.slice(start + 4, start + 4 + chunkSize)
            chunkReader.readAsArrayBuffer(chunkBlob)
        }

        // trigger read of the size of the next chunk
        var sizeBlob = this.blob.slice(start, start + 4)
        sizeReader.readAsArrayBuffer(sizeBlob)

    }

=======
export class EncryptedFileReader implements ReadableStream<Uint8Array>{

    private offset = 0

    private bytes_read = 0

    private stream: ReadableStream<Uint8Array>

    private current_reader = 0

    constructor(blob: Blob | File, header_size: number, encrypted_block_size: number) {
        const self = this
        this.stream = new ReadableStream<Uint8Array>({
            start(controller: ReadableStreamController<any>): void {
                //on start, read the encrypted file header
                self.read_next_chunk(controller, blob, header_size)
            },
            pull(controller: ReadableStreamController<any>): void | PromiseLike<void> {
                self.read_next_chunk(controller, blob, encrypted_block_size)
            },
            cancel(_reason: any): void { }
        })
    }
    getReader({ mode }: { mode: "byob" }): ReadableStreamBYOBReader
    getReader(): ReadableStreamDefaultReader<Uint8Array>
    getReader(__0?: any): ReadableStreamBYOBReader | ReadableStreamDefaultReader<Uint8Array> {
        return this.stream.getReader(__0)
    }
    [Symbol.asyncIterator]: (options?: ReadableStreamIteratorOptions | undefined) => ReadableStreamAsyncIterator<Uint8Array>
    pipeThrough<RS extends ReadableStream>(transform: {
        readable: RS
        writable: WritableStream<Uint8Array>
    }, options?: StreamPipeOptions): RS {
        return this.stream.pipeThrough(transform)
    }
    pipeTo(destination: WritableStream<Uint8Array>, options?: StreamPipeOptions): Promise<void> {
        return this.stream.pipeTo(destination, options)
    }
    [Symbol.asyncIterator]: (options?: ReadableStreamIteratorOptions | undefined) => ReadableStreamAsyncIterator<Uint8Array>
    public get locked() {
        return this.stream.locked
    }

    /**
     * Asynchronously iterates over the chunks in the stream's internal queue.
     *
     * Asynchronously iterating over the stream will lock it, preventing any other consumer from acquiring a reader.
     * The lock will be released if the async iterator's {@link ReadableStreamAsyncIterator.return | return()} method
     * is called, e.g. by breaking out of the loop.
     *
     * By default, calling the async iterator's {@link ReadableStreamAsyncIterator.return | return()} method will also
     * cancel the stream. To prevent this, use the stream's {@link ReadableStream.values | values()} method, passing
     * `true` for the `preventCancel` option.
     */
    values(options?: ReadableStreamIteratorOptions): ReadableStreamAsyncIterator<Uint8Array> {
        return this.stream.values(options)
    };
    /**
     * {@inheritDoc ReadableStream.values}
     */
    [Symbol.asyncIterator]: (options?: ReadableStreamIteratorOptions) => ReadableStreamAsyncIterator<Uint8Array>

    cancel(reason?: any): Promise<void> {
        return this.stream.cancel(reason)
    }

    tee(): [ReadableStream<Uint8Array>, ReadableStream<Uint8Array>] {
        return this.stream.tee()
    }

    read_next_chunk(controller: ReadableStreamController<any>, blob: Blob | File, chunk_size: number): void {
        if (this.offset >= blob.size) {
            //no point pulling more
            return
        }

        let file_reader = new FileReader()
        this.current_reader += 1

        file_reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target == null || e.target?.error) {
                return controller.error('error opening file for reading' + (e.target?.error ? ': ' + e.target?.error : ''))
            }
            let bytes = new Uint8Array(e.target.result as ArrayBuffer)
            // console.log("reader " + this.current_reader + ": " + bytes.byteLength + " bytes read")
            controller.enqueue(bytes)
            this.bytes_read += bytes.byteLength
            if (this.bytes_read >= blob.size) {
                //everything was read and enqueued - notify end
                controller.close()
                return
            }
        }

        file_reader.onabort = (_e: ProgressEvent<FileReader>) => {
            controller.error("file reader aborted")
        }

        const end = Math.min(blob.size, this.offset + chunk_size)
        const slice = blob.slice(this.offset, end)
        // console.log("pulling from reader " + this.current_reader + " start " + this.offset + " end " + end)
        this.offset = end
        file_reader.readAsArrayBuffer(slice)
    }
>>>>>>> 54f95b8 (re-importing from old repo)
}