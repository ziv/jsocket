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
 * // server is an instance of net.Server
 * // events is an instance of EventTarget providing error events during connection handling
 * ```
 *
 * @module
 */
import { createServer, type Server, type Socket } from 'node:net';
import { decode, encode } from './lib/msgpack';
import type { ValueType } from './lib/msgpack';
import read from './read';
import write from './write';

/** Connection handler */
export type ConnectionHandler = (buf: ValueType) => Promise<ValueType>;

/** Unix socket server */
export type UnixTransportServer<T = unknown> = {
    server: T;
    events: EventTarget;
};

/**
 * Create Unix socket server.
 * @param path string path to create unix-socket
 * @param handler connection handler to process incoming requests
 */
export default function server(path: string, handler: ConnectionHandler): UnixTransportServer<Server>;
/** @internal runtime signature contain dependencies. */
export default function server(
    path: string,
    handler: ConnectionHandler,
    // dependencies, do not use directly
    create = createServer,
): UnixTransportServer<Server> {
    const events = new EventTarget();
    const server = create(async (conn: Socket) => {
        let raw;
        try {
            raw = await read(conn);
        } catch (error) {
            events.dispatchEvent(
                new ErrorEvent('error reading from connection', {error}),
            );
            return;
        }
        let incoming;
        try {
            incoming = decode(raw);
        } catch (error) {
            events.dispatchEvent(
                new ErrorEvent('error decoding incoming data', {error}),
            );
            return;
        }
        let response;
        try {
            response = await handler(incoming);
        } catch (error) {
            events.dispatchEvent(new ErrorEvent('error handling request', {error}));
            return;
        }
        try {
            await write(conn, encode(response));
        } catch (error) {
            events.dispatchEvent(new ErrorEvent('error writing response', {error}));
        }
    });
    server.listen(path);
    server.on('error', (error) => {
        events.dispatchEvent(
            new ErrorEvent('error listening to server', {error}),
        );
    });
    return {server, events};
}
