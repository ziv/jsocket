/**
 * Read data from a readable stream.
 * Supports both ReadableStream and Node.js streams.
 * @module
 */
import type { Duplex, Readable } from "node:stream";

const EOF = "\0".charCodeAt(0);

/**
 * Concatenate an array of Uint8Arrays into a single Uint8Array.
 */
const concat = (chunks: Uint8Array[]): Uint8Array => {
    const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
};

/**
 * Read data from a readable stream.
 * Reads until the stream is closed or an EOF byte is encountered.
 *
 * @example usage:
 * ```ts
 * import { Readable } from "node:stream";
 * import { assertEquals } from "@std/assert";
 * import read from "@xpr/jsocket/read";
 *
 * const readable = new Readable({});
 * const raw = await read(readable);
 * ```
 */
export default function read(stream: Readable | Duplex): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: Uint8Array) => {
            chunks.push(chunk);
            if (chunk.at(-1) === EOF) {
                resolve(concat(chunks));
            }
        });
        stream.on("end", () => {
            resolve(concat(chunks));
        });
    });
}
