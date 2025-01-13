import type { Socket } from "node:net";

export default async function write(s: Socket, d: Uint8Array) {
    for (let i = 0; i < d.length; i += 1024) {
        await new Promise<void>((resolve, reject) => {
            s.write(d.slice(i, i + 1024), undefined, (err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(); // drain, continue to next chunk
                }
            });
        });
    }
}
