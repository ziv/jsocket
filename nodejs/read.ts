import type { Socket } from 'node:net';
import { Buffer } from 'node:buffer';

const EOF = Buffer.from('\0');

/**
 * Read data from a socket until EOF is reached.
 * @param s
 */
export default async function read(s: Socket) {
    return new Promise<Buffer>((resolve, reject) => {
        let buffer = Buffer.from('');
        s.on('data', (chunk: Buffer) => {
            buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
            if (buffer.at(-1) === EOF[0]) {
                resolve(buffer);
            }
        });
        s.on('end', () => {
            resolve(Buffer.concat([buffer, EOF], buffer.length + EOF.length));
        });
        s.on('error', reject);
    });
}