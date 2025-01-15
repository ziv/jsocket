/**
 * Create a Unix socket client and make a request.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import { createConnection } from 'node:net';
import type { ValueType } from './value';
import read from './read';
import write from './write';

/**
 * Create a Unix socket client and make a request.
 *
 * @example usage:
 * ```ts
 * import client from "@xpr/jsocket/client";
 *
 * const response = await client("/tmp/my-socket", "Hello, world!");
 * ```
 */
export default async function client<B extends ValueType, R extends ValueType>(
    path: string,
    body: B,
) {
    const {encode, decode} = await import('@std/msgpack');
    return new Promise<R>((resolve, reject) => {
        const conn = createConnection(path);
        conn.on('connect', async () => {
            const readable = read(conn);
            await write(conn, encode(body));
            const response = await readable;
            conn.end();
            resolve(decode(response) as R);
        });
        conn.on('error', reject);
    });
}
