import { concat } from "./utils.ts";

const EOF = new TextEncoder().encode("\0");

export default async function read(
  stream: ReadableStreamDefaultReader<Uint8Array>,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await stream.read();
    if (value instanceof Uint8Array) {
      chunks.push(value);
      if (value.at(-1) === EOF[0]) {
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
