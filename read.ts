/// <reference types="npm:@types/node@^22.10.5" />
/**
 * Read data from a readable stream.
 * Supports both ReadableStream and Node.js streams.
 * @module
 */
import { Duplex, Readable } from "node:stream";

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
async function readReadableStream(
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

/**
 * Read data from a readable stream.
 * Reads until the stream is closed or an EOF byte is encountered.
 * This overload is for compatibility with Node.js streams.
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
function readReadable(stream: Readable | Duplex): Promise<Uint8Array> {
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
export default function read(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array>;
/**
 * Read data from a readable stream.
 * Reads until the stream is closed or an EOF byte is encountered.
 * This overload is for compatibility with Node.js streams.
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
export default function read(
  stream: ReadableStream<Uint8Array> | Readable | Duplex,
): Promise<Uint8Array>;
/**
 * Read data from a readable stream.
 * Reads until the stream is closed or an EOF byte is encountered.
 */
export default function read(
  stream: ReadableStream<Uint8Array> | Readable | Duplex,
): Promise<Uint8Array> {
  if (stream instanceof Readable || stream instanceof Duplex) {
    return readReadable(stream);
  } else if (stream instanceof ReadableStream) {
    return readReadableStream(stream);
  }
  throw new Error("Unrecognised stream");
}
