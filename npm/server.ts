/**
 * Create Unix socket server.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import { createServer, type Server } from "node:net";
import { decode, encode, type ValueType } from "@std/msgpack";
import read from "./read.ts";
import write from "./write.ts";

/**
 * Connection handler function.
 * Accepts a string buffer and returns a string.
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
): UnixTransportServer<Server> {
    const events = new EventTarget();
    const server = createServer(async (conn) => {
        try {
            const request = decode(await read(conn));
            const response = await handler(request);
            await write(conn, encode(response));
        } catch (error) {
            events.dispatchEvent(new ErrorEvent("error", { error }));
        }
    });
    server.listen(path);
    return { server, events };
}
