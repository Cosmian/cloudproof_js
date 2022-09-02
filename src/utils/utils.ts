import { logger } from "./logger";

/**
 * Hex encode an array of bytes
 * @param array the bytes
 * @returns the hex encoded string
 */
export function hexEncode(array: Uint8Array): string {
    return array.reduce((prev, current) => {
        return prev + current.toString(16).padStart(2, '0')
    }, "")

}

/**
 * Hex decode to an array of bytes
 * @param hexString the hex encoded string
 * @returns the decoded array of bytes
 */
export function hexDecode(hexString: string): Uint8Array {
    return new Uint8Array(hexString.split(/(\w\w)/g)
        .filter(p => !!p)
        .map(c => parseInt(c, 16)))

    // The regex passed to split captures groups of two characters,
    // but this form of split will intersperse them with empty strings
    // (the stuff "between" the captured groups, which is nothing!).
    // So filter is used to remove the empty strings
}

/**
 * Convert a u32 represented as a 4-bytes value in big endian to a u32 value
 *
 * @param bytes this a 4-bytes value representing an u32 in big endian
 * @returns the u32 value
 */
export function fromBeBytes(bytes: Uint8Array): number {
    // Create a buffer
    const buf = new ArrayBuffer(4);
    // Create a data view of it
    const view = new DataView(buf);
    // set bytes
    bytes.forEach((b, i) => {
        view.setUint8(i, b);
    });

    // Read the bits as a float; note that by doing this, we're implicitly
    // converting it from a 32-bit float into JavaScript's native 64-bit double
    return view.getUint32(0);
}

/**
 * Convert a u32 value to a u32 represented as a 4-bytes value in big endian
 *
 * @param myNumber a u32 value
 * @returns the u32 represented as a 4-bytes value in big endian
 */
export function toBeBytes(myNumber: number): Uint8Array {
    // Convert symmetric key length to 4-bytes array
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, myNumber, false);
    return new Uint8Array(arr, 0)
}

/**
 * Return the number of bytes for encoding the number of bytes of the deserialized item
 *
 * @param stream Array being deserialized when using LEB128 deserialization
 * @returns number of bytes
 */
function getSizeNumberOfBytes(stream: Uint8Array) {
    const a: number[] = [];

    for (const element of stream) {
        const b = element;
        a.push(b);

        logger.log(() => "a : " + a + " b: " + b);
        // tslint:disable-next-line: no-bitwise
        if ((b & 0x80) === 0) {
            logger.log(() => "break")
            break;
        }
    }

    return a.length;
}

/**
 * Deserialize Uint8Array as a list of Uint8Array
 *
 * @param serializedItems Uint8Array of serialized data
 * @returns an array of deserialized items
 */
export function deserializeList(serializedItems: Uint8Array): Uint8Array[] {
    const leb = require('leb128');
    const items: Uint8Array[] = [];
    while (serializedItems.length > 1) {
        const itemLen = parseInt(leb.unsigned.decode(serializedItems), 10);
        const sizeNumberOfBytes = getSizeNumberOfBytes(serializedItems);
        logger.log(() => "deserializeList: sizeNumberOfBytes: " + sizeNumberOfBytes);

        const item = serializedItems.slice(sizeNumberOfBytes, sizeNumberOfBytes + itemLen);
        serializedItems = serializedItems.slice(sizeNumberOfBytes + itemLen);
        logger.log(() => "deserializeList: itemLen: " + itemLen);
        logger.log(() => "deserializeList: item: " + item);
        items.push(item);
    }
    return items;
}

/**
 * Deserialize Uint8Array as an array of objects with key and value
 *
 * @param serializedItems Uint8Array of serialized data
 * @returns an array of objects with key and value properties as Uint8Array
 */
export function deserializeHashMap(serializedItems: Uint8Array): { key: Uint8Array, value: Uint8Array }[] {
    const leb = require('leb128');
    const items: {
        key: Uint8Array, value: Uint8Array
    }[] = [];
    while (serializedItems.length > 1) {
        const keyLen = parseInt(leb.unsigned.decode([...serializedItems]), 10);
        const sizeNumberOfBytes = getSizeNumberOfBytes(serializedItems);
        logger.log(() => "deserializeHashMap: sizeNumberOfBytes: " + sizeNumberOfBytes);
        const key = serializedItems.slice(sizeNumberOfBytes, sizeNumberOfBytes + keyLen);
        serializedItems = serializedItems.slice(sizeNumberOfBytes + keyLen);

        if (key.length > 1) {
            const valueLen = parseInt(leb.unsigned.decode(serializedItems), 10);
            const sizeNumberOfBytes = getSizeNumberOfBytes(serializedItems);
            logger.log(() => "deserializeHashMap: sizeNumberOfBytes(2): " + sizeNumberOfBytes);
            const value = serializedItems.slice(sizeNumberOfBytes, sizeNumberOfBytes + valueLen);
            const item: { key: Uint8Array, value: Uint8Array } = { key: new Uint8Array(), value: new Uint8Array() };
            if (value.length > 0) {
                item.key = key;
                item.value = value;
            }
            items.push(item);
            serializedItems = serializedItems.slice(sizeNumberOfBytes + valueLen);
        }
    }
    return items;
}

/**
 * Serialize a list of Uint8Array as a Uint8Array
 *
 * @param list an array of deserialized item
 * @returns Uint8Array of serialized data
 */
export function serializeList(list: Uint8Array[]): Uint8Array {
    const leb = require('leb128');
    let serializedData = new Uint8Array();
    for (const item of list) {
        const itemLen = leb.unsigned.encode(item.length);
        serializedData = Uint8Array.from([...serializedData, ...itemLen, ...item])
    }
    serializedData = Uint8Array.from([...serializedData, 0])
    return serializedData;
}

/**
 * Serialize an array of uids and values as a Uint8Array
 *
 * @param data an array of objects containing uids and values
 * @returns Uint8Array of serialized data
 */
export function serializeHashMap(data: { uid: Uint8Array, value: Uint8Array }[]): Uint8Array {
    const leb = require('leb128');
    let serializedData = new Uint8Array();
    for (const item of data) {
        const keyLen = leb.unsigned.encode(item.uid.length);
        const valueLen = leb.unsigned.encode(item.value.length);
        serializedData = Uint8Array.from([...serializedData, ...keyLen, ...item.uid, ...valueLen, ...item.value])
    }
    serializedData = Uint8Array.from([...serializedData, 0])
    return serializedData;
}
