/**
 * Create Unix socket server.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import read from "./read.ts";
import write from "./write.ts";
import { addEOF, removeEOF } from "./utils.ts";

/**
 * Connection handler function.
 * Accepts a string buffer and returns a string.
 */
export type ConnectionHandler = (buf: string) => Promise<string>;

/**
 * Unix socket server.
 */
export type UnixTransportServer<T = unknown> = { server: T };

/**
 * Create and start listening to Unix socket server.
 *
 * @example usage:
 * ```ts
 * import createServer from "@xpr/jsocket/server";
 *
 * await createServer("/tmp/my-socket", async (buf: string) => {
 *   console.log("Received:", buf);
 *   return "OK";
 * });
 * ```
 *
 * @module
 */
export default function server(
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
