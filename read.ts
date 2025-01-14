/**
 * Read data from a readable stream.
 * Supports both ReadableStream and Node.js streams.
 * @module
 */

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
      chunks.push(value);
      if (value.at(-1) === EOF) {
        break;
      }
    } else {
      break;
    }
    if (done) {
      break;
    }
  }
  return concat(chunks);
}
