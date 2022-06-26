/**
 * Copyright Cosmian 2021 -
 */

<<<<<<< HEAD
import { logger } from "../../utils/logger"
logger.on = false
=======
>>>>>>> 54f95b8 (re-importing from old repo)

const SW_PATH = "cdsw"

interface DownloadConfig {
    stream: ReadableStream<Uint8Array>
    port: MessagePort
    filename: string
    mimeType: string
    size?: number
}

class DownloadServiceWorker {
    pendingDownloads = new Map<string, DownloadConfig>();

    constructor() {
        self.addEventListener('install', this.onInstall)
        self.addEventListener('activate', this.onActivate)
        self.addEventListener('message', this.onMessage)
        self.addEventListener('fetch', this.onFetch)
<<<<<<< HEAD
        logger.log(() => "--serviceWorker Instantiated")
=======
        // console.log("--ServiceWorker Instantiated")
>>>>>>> 54f95b8 (re-importing from old repo)
    }

    onInstall = () => {
        (self as any).skipWaiting()
<<<<<<< HEAD
        logger.log(() => "--serviceWorker Installed")
=======
        // console.log("--ServiceWorker Installed")
>>>>>>> 54f95b8 (re-importing from old repo)
    };

    onActivate = (event: any) => {
        // set the SV as  the controller for all clients
        event.waitUntil((self as any).clients.claim())
<<<<<<< HEAD
        logger.log(() => "--serviceWorker Activated")
=======
        // console.log("--ServiceWorker Activated")
>>>>>>> 54f95b8 (re-importing from old repo)
    };

    /**
     * Intercepts requests on the generated download url
     * and responds with a stream, that client itself controls.
     */
    onFetch = (event: any) => {

<<<<<<< HEAD
        logger.log(() => `--serviceWorker fetch ${event.request.url}`)
=======
        // console.log(`--ServiceWorker fetch ${event.request.url}`)
>>>>>>> 54f95b8 (re-importing from old repo)

        const { url } = event.request

        if (url.endsWith(`/${SW_PATH}/ping`)) {
            return event.respondWith(new Response('pong'))
        }

        const pendingDownload = this.pendingDownloads.get(url)
        if (!pendingDownload) {
<<<<<<< HEAD
            console.error(`--serviceWorker unknown download URL: ${event.request.url}`)
            return
        }

        logger.log(() => "--service worker: intercept " + url)

=======
            console.error(`--ServiceWorker unknown download URL: ${event.request.url}`)
            return
        }

>>>>>>> 54f95b8 (re-importing from old repo)
        const { stream, filename, size, mimeType } = pendingDownload

        this.pendingDownloads.delete(url)

        const headers = new Headers({
            ...(size ? { 'Content-Length': `${size}` } : {}),
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${encodeURI(filename)}"`,
            'Content-Security-Policy': "default-src 'none'",
            'X-Content-Security-Policy': "default-src 'none'",
            'X-WebKit-CSP': "default-src 'none'",
            'X-XSS-Protection': '1; mode=block',
        })

        event.respondWith(new Response(stream, { headers }))
    };

    /**
     * Called once before each download, opens a stream for file data
     * and generates a unique download link for the app to call to download file.
     */
    onMessage = (event: any) => {
        if (event.data?.action !== 'register_download') {
            return
        }

        const { filename, mimeType, size } = event.data.payload
        const downloadUrl = encodeURI(`${(self as any).registration.scope}/dwnld/${Math.random()}/${filename}`)

        const port = event.ports[0]

        this.pendingDownloads.set(downloadUrl, {
            stream: createDownloadStream(port),
            filename,
            mimeType,
            size,
            port,
        })

        port.postMessage({ action: 'fetch_url', payload: downloadUrl })
    };
}

/**
 * Open a stream of data passed over MessageChannel.
 * Every download has it's own stream from app to SW.
 *
 * @param port MessageChannel port to listen on
 */
function createDownloadStream(port: MessagePort) {
    return new ReadableStream({
        start(controller: ReadableStreamDefaultController) {
            port.onmessage = ({ data }) => {
                switch (data?.action) {
                    case 'write':
<<<<<<< HEAD
                        // try {
                        return controller.enqueue(data?.payload)
                    // } catch (error) {
                    // controller is likely closed following user cancel action ignore
                    // return
                    // }
=======
                        return controller.enqueue(data?.payload)
>>>>>>> 54f95b8 (re-importing from old repo)
                    case 'close':
                        return controller.close()
                    case 'abort':
                        return controller.error(data?.reason)
                    default:
                        console.error(`Download readable stream: unknown action "${data?.action}"`)
                }
            }
        },
        cancel() {
<<<<<<< HEAD
            logger.log(() => "--service worker: cancel called")
=======
>>>>>>> 54f95b8 (re-importing from old repo)
            port.postMessage({ action: 'cancel' })
        },
    })
}

export default new DownloadServiceWorker()