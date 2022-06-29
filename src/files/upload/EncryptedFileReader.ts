
/**
 * Copyright Cosmian 2021 -
 */

import { ReadableStream, WritableStream, ReadableStreamAsyncIterator, ReadableStreamBYOBReader, ReadableStreamDefaultReader, ReadableStreamIteratorOptions, ReadableWritablePair, StreamPipeOptions } from "web-streams-polyfill"
import { logger } from "../../utils/logger"
import { fromBeBytes } from "../../utils/utils"
export class EncryptedFileReader implements ReadableStream<Uint8Array>{

    private offset = 0

    private bytes_read = 0

    private stream: ReadableStream<Uint8Array>

    private currentReader = 0

    constructor(blob: Blob | File, header_size: number, encrypted_block_size: number) {
        const self = this
        this.stream = new ReadableStream<Uint8Array>(new BlobUnderlyingSource(blob))
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

}

class BlobUnderlyingSource implements UnderlyingSource {

    stream: NodeJS.ReadableStream | null
    blobSize: number

    bytesRead: number

    constructor(blob: Blob | File) {
        // this.stream = blob.stream()
        // this.stream.setEncoding("binary")

        this.stream = null
        this.blobSize = blob.size
    }

    start(controller: ReadableStreamController<any>): void {
        // let buf = this.stream.read(4) as Buffer
        // let headerSize = fromBeBytes(buf)
        // let encryptedHeader = this.stream.read(headerSize)
        // this.bytesRead = headerSize + 4
        // controller.enqueue(encryptedHeader)
    }
    pull(controller: ReadableStreamController<any>): void | PromiseLike<void> {

        // if (this.bytesRead >= this.blobSize) {
        //     controller.close()
        //     return
        // }
        // let buf = this.stream.read(4) as Buffer
        // let contentSize = fromBeBytes(buf)
        // let encryptedContent = this.stream.read(contentSize)
        // this.bytesRead += 4 + contentSize
        // controller.enqueue(encryptedContent)
    }
    cancel(reason: any): void {
        logger.log(() => "Canceled call on underlying stream: " + reason)
    }
}