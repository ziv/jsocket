/**
 * This package provides a simple way to create a server/client
 * communication (request/response method) using unix sockets.
 *
 * The package supports both `Deno` and `Node.js`.
 *
 * ## Read and write data from streams.
 *
 * All read and write operations are throttled to avoid memory exhaustion.
 *
 * @example read from *any* readable stream
 * ```ts
 * import { read } from "@xpr/jsocket/read";
 *
 * const stream = getReadableStream();
 * const data = await read(stream);
 * ```
 *
 * @example write to any writable stream
 * ```ts
 * import { write } from "@xpr/jsocket/write";
 *
 * const stream = getWritableStream();
 * await write(stream, data);
 * ```
 *
 * ## Creating a Unix socket server and client
 *
 * @example example server:
 * ```ts
 * import createServer from "@xpr/jsocket/server";
 *
 * await createServer("/tmp/my-socket", async (buf: string) => {
 *    return buf.toUpperCase();
 * });
 * ```
 *
 * @example example client:
 * ```ts
 * import request from "@xpr/jsocket/request";
 *
 * const response = await request("/tmp/my-socket", "Hello, world!");
 * console.log(response); // HELLO, WORLD!
 * ```
 *
 * @module
 */
import read from "./read";
import write from "./write";
import client from "./client";
import server from "./server";

export { client, read, server, write };
