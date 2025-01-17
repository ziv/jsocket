/**
 * Create Unix socket server.
 * Node.js version.
 *
 * @example usage:
 * ```ts
 * import createServer from "@xpr/jsocket/server";
 *
 * const { server, events } = await createServer("/tmp/my-socket", async (buf: ValueType) => {
 *   console.log("Received:", buf);
 *   return "OK" as ValueType;
 * });
 *
 * // server is an instance of Deno.Listener
 * // events is an instance of EventTarget providing error events during connection handling
 * ```
 *
 * Deno version.
 * @module
 */
import { decode, encode, type ValueType } from "@std/msgpack";
import read from "./read.ts";
import write from "./write.ts";

/** Connection handler */
export type ConnectionHandler = (buf: ValueType) => Promise<ValueType>;

/**
 * Unix socket server.
 */
export type UnixTransportServer<T = unknown> = {
  server: T;
  events: EventTarget;
};

/**
 * Create Unix socket server.
 * @param path string path to create unix-socket
 * @param handler connection handler to process incoming requests
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
