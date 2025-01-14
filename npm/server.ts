/**
 * Create Unix socket server.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import { createServer, type Server } from "node:net";
import read from "./read.js";
import write from "./write.js";
import { addEOF, removeEOF } from "./utils.js";

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
): UnixTransportServer<Server> {
    const server = createServer(async (conn) => {
        const buf = new TextDecoder().decode(await read(conn));
        const res = await handler(removeEOF(buf));
        await write(conn, new TextEncoder().encode(addEOF(res)));
    });
    server.listen(path);
    return { server };
}
