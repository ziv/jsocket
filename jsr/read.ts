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
 * Deno version.
 * @module
 */
import { concat } from "@std/bytes";

const EOF = "\0".charCodeAt(0);

/** Read data from a readable stream. */
export default async function read(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (value instanceof Uint8Array) {
      if (value.at(-1) === EOF) {
        chunks.push(value.slice(0, -1)); // Remove EOF
        break;
      }
      chunks.push(value);
    } else {
      break;
    }
    if (done) {
      break;
    }
  }
  return concat(chunks);
}
