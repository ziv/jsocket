/**
 * Create Unix socket server.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import { decode, encode, type ValueType } from "@std/msgpack";
import read from "./read.ts";
import write from "./write.ts";

/**
 * Connection handler function.
 */
export type ConnectionHandler = (buf: ValueType) => Promise<ValueType>;

/**
 * Unix socket server.
 */
export type UnixTransportServer<T = unknown> = {
  server: T;
  events: EventTarget;
};

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
  const events = new EventTarget();
  (async () => {
    for await (const conn of server) {
      try {
        const request = decode(await read(conn.readable));
        const response = await handler(request);
        await write(conn.writable, encode(response));
      } catch (error) {
        try {
          conn.close && conn.close();
        } catch (_) {
          // ignore
        }
        events.dispatchEvent(new ErrorEvent("error", { error }));
      }
    }
  })();
  return { server, events };
}
