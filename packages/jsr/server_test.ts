import { decode, encode } from "@std/msgpack";
import { concat } from "@std/bytes";
import { assertSpyCalls, returnsNext, stub } from "@std/testing/mock";
import { assertEquals } from "@std/assert";
import server from "./server.ts";

Deno.test("server should accept a connection and let the handler handle it", async () => {
  // input with EOF
  const input = concat([encode("test"), new Uint8Array([0])]);
  // stub Deno.listen
  let listener;

  // output written to "ret"
  const ret = await new Promise((resolve) => {
    const dummyConnection = {
      readable: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(input);
        },
      }),
      writable: new WritableStream<Uint8Array>({
        write(chunk) {
          resolve(chunk);
        },
      }),
    };

    const dummyServer = {
      async *[Symbol.asyncIterator]() {
        yield dummyConnection;
      },
    };

    listener = stub(Deno, "listen", returnsNext([dummyServer as never]));

    server(
      "socket",
      (buf) => Promise.resolve((buf as string).toString().toUpperCase()),
    );
  })
    // decoding and removing EOF
    .then((r) => decode((r as Uint8Array).slice(0, -1)));

  assertSpyCalls(listener as never, 1);
  assertEquals(ret, "TEST");
});
