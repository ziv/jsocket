/**
 * Read data from a readable stream.
 * Supports both ReadableStream and Node.js streams.
 * @module
 */
import { concat } from "@std/bytes";

const EOF = "\0".charCodeAt(0);

/**
 * Read data from a readable stream.
 * Reads until the stream is closed or an EOF byte is encountered.
 *
 * @example usage:
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import read from "@xpr/jsocket/read";
 *
 * const readable = new ReadableStream<Uint8Array>({});
 * const raw = await read(readable);
 * ```
 */
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
