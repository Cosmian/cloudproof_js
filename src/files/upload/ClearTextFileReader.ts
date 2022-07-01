/**
 * Copyright Cosmian 2021 -
 */


import { ReadableStream, WritableStream, ReadableStreamAsyncIterator, ReadableStreamBYOBReader, ReadableStreamDefaultReader, ReadableStreamIteratorOptions, ReadableWritablePair, StreamPipeOptions } from "web-streams-polyfill"
import { logger } from "../../utils/logger"
export class ClearTextFileReader implements ReadableStream<Uint8Array>{

    private offset = 0

    private bytes_read = 0

    private stream: ReadableStream<Uint8Array>

    constructor(blob: Blob | File, block_size: number) {

        const self = this
        this.stream = new ReadableStream<Uint8Array>({
            start(_controller: ReadableStreamController<any>): void {
                // logger.log(() => "STREAM: ", blob.stream())
            },
            pull(controller: ReadableStreamController<any>): void | PromiseLike<void> {

                if (self.offset >= blob.size) {
                    //no point pulling more
                    return
                }

                let file_reader = new FileReader()
                // self.current_reader += 1

                file_reader.onload = (e: ProgressEvent<FileReader>) => {
                    if (e.target == null || e.target?.error) {
                        return controller.error('error opening file for reading' + (e.target?.error ? ': ' + e.target?.error : ''))
                    }
                    let bytes = new Uint8Array(e.target.result as ArrayBuffer)
                    // logger.log(() => "reader " + self.current_reader + ": " + bytes.byteLength + " bytes read")
                    controller.enqueue(bytes)
                    self.bytes_read += bytes.byteLength
                    if (self.bytes_read >= blob.size) {
                        //everything was read and enqueued - notify end
                        logger.log(() => "ClearTextReader: Done reading " + blob.size + " bytes. Closing controller")
                        controller.close()
                    }
                }

                file_reader.onabort = (_e: ProgressEvent<FileReader>) => {
                    controller.error("file reader aborted")
                }

                const end = Math.min(blob.size, self.offset + block_size)
                const slice = blob.slice(self.offset, end)
                // logger.log(() => "pulling from reader " + self.current_reader + " start " + self.offset + " end " + end)
                self.offset = end
                file_reader.readAsArrayBuffer(slice)
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
}