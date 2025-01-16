import test from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import read from "./read";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

test("read() should read stream till EOF", async () => {
  const stream = Readable.from([
    encoder.encode("te"),
    encoder.encode("st\0"),
    encoder.encode("more"),
  ]);
  assert.equal(decoder.decode(await read(stream)), "test");
});

test("read() should read stream till end", async () => {
  const stream = Readable.from([
    encoder.encode("te"),
    encoder.encode("st"),
  ]);
  assert.equal(decoder.decode(await read(stream)), "test");
});
