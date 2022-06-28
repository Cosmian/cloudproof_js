
/**
 * Copyright Cosmian 2021 -
 */

import { ReadableStream, WritableStream, ReadableStreamAsyncIterator, ReadableStreamBYOBReader, ReadableStreamDefaultReader, ReadableStreamIteratorOptions, ReadableWritablePair, StreamPipeOptions } from "web-streams-polyfill"
export class EncryptedFileReader implements ReadableStream<Uint8Array>{

    private offset = 0

    private bytes_read = 0

    private stream: ReadableStream<Uint8Array>

    private currentReader = 0

    constructor(blob: Blob | File, header_size: number, encrypted_block_size: number) {
        const self = this
        this.stream = new ReadableStream<Uint8Array>({
            start(controller: ReadableStreamController<any>): void {

                blob.stream().read()

                //on start, read the encrypted file header
                let fileReader = self.getFileReader(controller, blob.size)
                fileReader.re
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

        const fileReader = this.getFileReader(controller, blob.size)

        const end = Math.min(blob.size, this.offset + chunk_size)
        const slice = blob.slice(this.offset, end)
        // console.log("pulling from reader " + this.current_reader + " start " + this.offset + " end " + end)
        this.offset = end
        fileReader.readAsArrayBuffer(slice)
    }

    getFileReader(controller: ReadableStreamController<any>, blobSize: number): FileReader {

        let fileReader = new FileReader()
        this.currentReader += 1

        fileReader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target == null || e.target?.error) {
                return controller.error('error opening file for reading' + (e.target?.error ? ': ' + e.target?.error : ''))
            }
            let bytes = new Uint8Array(e.target.result as ArrayBuffer)
            // console.log("reader " + this.current_reader + ": " + bytes.byteLength + " bytes read")
            controller.enqueue(bytes)
            this.bytes_read += bytes.byteLength
            if (this.bytes_read >= blobSize) {
                //everything was read and enqueued - notify end
                controller.close()
                return
            }
        }

        fileReader.onabort = (_e: ProgressEvent<FileReader>) => {
            controller.error("file reader aborted")
        }

        return fileReader

    }
}