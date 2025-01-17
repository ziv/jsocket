import test from "node:test";
import assert from "node:assert";
import { Writable } from "node:stream";
import write from "./write";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

test("write() should write stream while adding EOF", async () => {
  let res = new Uint8Array();
  const stream = new Writable({
    write(
      chunk: Uint8Array,
      _: never,
      callback: (error?: Error | null) => void,
    ) {
      res = chunk;
      callback();
    },
  });
  await write(stream, encoder.encode("test"));
  assert.equal(decoder.decode(res), "test\0");
});
