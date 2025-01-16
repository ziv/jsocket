/**
 * Read binary data from a readable stream.
 *
 * Takes a readable stream read it till it ends or an EOF byte is encountered
 * Returns the data as a Uint8Array while removing the EOF byte.
 *
 * Supports Node.js Readable streams.
 *
 * @example usage:
 * ```ts
 * import { Readable } from "node:stream";
 * import read from "@xpr/jsocket/read";
 *
 * const readable = new Readable({});
 * const data: Uint8Array = await read(readable);
 * ```
 *
 * @module
 */
import type { Duplex, Readable } from "node:stream";
import { concat } from "./lib/concat";

const EOF = "\0".charCodeAt(0);

/** Read data from a readable stream. */
export default function read(
  stream: Readable | Duplex,
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: unknown) => {
      if (!(chunk instanceof Uint8Array)) {
        throw new Error("Expected Uint8Array stream");
      }
      chunks.push(chunk);
      if (chunk.at(-1) === EOF) {
        resolve(concat(chunks).slice(0, -1)); // Remove EOF
      }
    });
    stream.on("end", () => {
      resolve(concat(chunks));
    });
  });
}
