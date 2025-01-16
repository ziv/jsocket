/**
 * @see https://jsr.io/@std/bytes/1.0.4/concat.ts
 */
export function concat(buffers: Uint8Array[]): Uint8Array {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const buffer of buffers) {
        output.set(buffer, index);
        index += buffer.length;
    }

    return output;
}