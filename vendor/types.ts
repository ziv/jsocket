export type ConnectionHandler = (buf: string) => Promise<string>;

export type UnixTransportServer<T = unknown> = { server: T };

export type CreateServer<T = unknown> = (
  path: string,
  handler: ConnectionHandler,
) => UnixTransportServer<T>;

export type CreateClient = (path: string, buf: string) => Promise<string>;
