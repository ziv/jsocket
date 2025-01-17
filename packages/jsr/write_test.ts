import { assertEquals } from "@std/assert";
import write from "./write.ts";

Deno.test("write() write to stream and add EOF at the end", async () => {
  let text = "";
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      text += new TextDecoder().decode(chunk);
    },
  });
  await write(writable, new TextEncoder().encode("Hello, world!"));
  assertEquals(text, "Hello, world!\0");
});
