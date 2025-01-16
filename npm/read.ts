/**
 * Read data from a readable stream.
 * Supports both ReadableStream and Node.js streams.
 * @module
 */
import type { Duplex, Readable } from 'node:stream';
import { concat } from './lib/concat';

const EOF = '\0'.charCodeAt(0);

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
export default async function read(
    stream: Readable | Duplex,
): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk: Uint8Array) => {
            chunks.push(chunk);
            if (chunk.at(-1) === EOF) {
                resolve(concat(chunks).slice(0, -1)); // Remove EOF
            }
        });
        stream.on('end', () => {
            resolve(concat(chunks));
        });
    });
}
