import type { ConnectionHandler, UnixTransportServer } from "./types.ts";
import read from "../read.ts";
import write from "../write.ts";
import { addEOF, removeEOF } from "./utils.ts";

export default function createDenoServer(
  path: string,
  handler: ConnectionHandler,
): UnixTransportServer<Deno.Listener> {
  const server = Deno.listen({ path, transport: "unix" });
  (async () => {
    for await (const conn of server) {
      const buf = new TextDecoder().decode(await read(conn.readable));
      const res = await handler(removeEOF(buf));
      await write(conn.writable, new TextEncoder().encode(addEOF(res)));
    }
  })();
  return { server };
}
