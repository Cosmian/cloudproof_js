/**
 * Copyright Cosmian 2021 -
 */

import { WritableStream } from 'web-streams-polyfill'
import { logger } from '../../utils/logger'

const SW_PATH = "cdsw"

export interface FileMetaData {
    filename: string
    mimeType: string
    size?: number
}

/**
 * Trigger a file download in the browser using the content passed written
 * to the returned `WritableStream`
 * @param file_meta_data 
 * @param cancel 
 * @returns a `WritableStream`
 */
export const download = async (file_meta_data: FileMetaData, cancel: () => void): Promise<WritableStream> => {
    const registration = await ensure_sw()
    const worker = registration.active || registration.installing
    if (worker == null) {
        return Promise.reject("The Download Service Worker is NOT active")
    }
    const channel = new MessageChannel()
    channel.port1.onmessage = (event: MessageEvent) => {
        if (event.data == null) {
            console.error(`No data received from the service worker: ${event.origin}`)
            return
        }
        if (event.data.action === 'cancel') {
            cancel()
        } else if (event.data.action === 'fetch_url') {
            logger.log(() => "creating IFrame for " + event.data.payload)
            createIFrame(event.data.payload)
        } else {
            console.error(`Unknown action received from the service worker: ${event.data.action}`)
        }
    }
    const stream = writeable_stream(channel.port1)
    worker.postMessage({ action: 'register_download', payload: file_meta_data }, [channel.port2])
    return stream
}

const ensure_sw = async (): Promise<ServiceWorkerRegistration> => {
    const existing_sw = (await navigator.serviceWorker.getRegistrations()).find((registration) => {
        const url = new URL(registration.scope)
        // console.log("URL", url)
        return url.host == document.location.host && url.pathname == `/${SW_PATH}`
    })
    if (existing_sw) {
        // console.log("Download SW already active")
        return existing_sw

    }
    // console.log("Registering new download SW")
    return navigator.serviceWorker.register(new URL('./DownloadServiceWorker', import.meta.url), { scope: `/${SW_PATH}` })
}



function createIFrame(src: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe')
    iframe.hidden = true
    iframe.src = src
    iframe.name = 'iframe'
    document.body.appendChild(iframe)
    return iframe
}

const writeable_stream = (worker_port: MessagePort, abort_signal?: AbortSignal): WritableStream<Uint8Array> => {

    if (typeof (abort_signal) !== "undefined") {
        abort_signal.addEventListener('abort', () => {
            worker_port.postMessage({ action: 'abort', reason: 'Download aborted by user' })
        })
    }

    return new WritableStream({
        write(block: Uint8Array) {
            worker_port.postMessage({ action: 'write', payload: block })
        },
        close() {
            worker_port.postMessage({ action: 'close' })
        },
        abort(reason) {
            worker_port.postMessage({ action: 'abort', reason: String(reason) })
        },
    })


}