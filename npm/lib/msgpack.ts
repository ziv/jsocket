/**
 * @see https://jsr.io/@std/msgpack/1.0.2/encode.ts
 * @see https://jsr.io/@std/msgpack/1.0.2/decode.ts
 */
import { concat } from './concat';

export type ValueType =
    | number
    | bigint
    | string
    | boolean
    | null
    | Uint8Array
    | readonly ValueType[]
    | ValueMap;

export interface ValueMap {
    [index: string | number]: ValueType;
}

const FOUR_BITS = 16;
const FIVE_BITS = 32;
const SEVEN_BITS = 128;
const EIGHT_BITS = 256;
const FIFTEEN_BITS = 32768;
const SIXTEEN_BITS = 65536;
const THIRTY_ONE_BITS = 2147483648;
const THIRTY_TWO_BITS = 4294967296;
const SIXTY_THREE_BITS = 9223372036854775808n;
const SIXTY_FOUR_BITS = 18446744073709551616n;

const encoder = new TextEncoder();

export function encode(object: ValueType): Uint8Array {
    const byteParts: Uint8Array[] = [];
    encodeSlice(object, byteParts);
    return concat(byteParts);
}

function encodeFloat64(num: number) {
    const dataView = new DataView(new ArrayBuffer(9));
    dataView.setFloat64(1, num);
    dataView.setUint8(0, 0xcb);
    return new Uint8Array(dataView.buffer);
}

function encodeNumber(num: number) {
    if (!Number.isInteger(num)) { // float 64
        return encodeFloat64(num);
    }

    if (num < 0) {
        if (num >= -FIVE_BITS) { // negative fixint
            return new Uint8Array([num]);
        }

        if (num >= -SEVEN_BITS) { // int 8
            return new Uint8Array([0xd0, num]);
        }

        if (num >= -FIFTEEN_BITS) { // int 16
            const dataView = new DataView(new ArrayBuffer(3));
            dataView.setInt16(1, num);
            dataView.setUint8(0, 0xd1);
            return new Uint8Array(dataView.buffer);
        }

        if (num >= -THIRTY_ONE_BITS) { // int 32
            const dataView = new DataView(new ArrayBuffer(5));
            dataView.setInt32(1, num);
            dataView.setUint8(0, 0xd2);
            return new Uint8Array(dataView.buffer);
        }

        // float 64
        return encodeFloat64(num);
    }

    // if the number fits within a positive fixint, use it
    if (num <= 0x7f) {
        return new Uint8Array([num]);
    }

    if (num < EIGHT_BITS) { // uint8
        return new Uint8Array([0xcc, num]);
    }

    if (num < SIXTEEN_BITS) { // uint16
        const dataView = new DataView(new ArrayBuffer(3));
        dataView.setUint16(1, num);
        dataView.setUint8(0, 0xcd);
        return new Uint8Array(dataView.buffer);
    }

    if (num < THIRTY_TWO_BITS) { // uint32
        const dataView = new DataView(new ArrayBuffer(5));
        dataView.setUint32(1, num);
        dataView.setUint8(0, 0xce);
        return new Uint8Array(dataView.buffer);
    }

    // float 64
    return encodeFloat64(num);
}

function encodeSlice(object: ValueType, byteParts: Uint8Array[]) {
    if (object === null) {
        byteParts.push(new Uint8Array([0xc0]));
        return;
    }

    if (object === false) {
        byteParts.push(new Uint8Array([0xc2]));
        return;
    }

    if (object === true) {
        byteParts.push(new Uint8Array([0xc3]));
        return;
    }

    if (typeof object === 'number') {
        byteParts.push(encodeNumber(object));
        return;
    }

    if (typeof object === 'bigint') {
        if (object < 0) {
            if (object < -SIXTY_THREE_BITS) {
                throw new Error('Cannot safely encode bigint larger than 64 bits');
            }

            const dataView = new DataView(new ArrayBuffer(9));
            dataView.setBigInt64(1, object);
            dataView.setUint8(0, 0xd3);
            byteParts.push(new Uint8Array(dataView.buffer));
            return;
        }

        if (object >= SIXTY_FOUR_BITS) {
            throw new Error('Cannot safely encode bigint larger than 64 bits');
        }

        const dataView = new DataView(new ArrayBuffer(9));
        dataView.setBigUint64(1, object);
        dataView.setUint8(0, 0xcf);
        byteParts.push(new Uint8Array(dataView.buffer));
        return;
    }

    if (typeof object === 'string') {
        const encoded = encoder.encode(object);
        const len = encoded.length;

        if (len < FIVE_BITS) { // fixstr
            byteParts.push(new Uint8Array([0xa0 | len]));
        } else if (len < EIGHT_BITS) { // str 8
            byteParts.push(new Uint8Array([0xd9, len]));
        } else if (len < SIXTEEN_BITS) { // str 16
            const dataView = new DataView(new ArrayBuffer(3));
            dataView.setUint16(1, len);
            dataView.setUint8(0, 0xda);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else if (len < THIRTY_TWO_BITS) { // str 32
            const dataView = new DataView(new ArrayBuffer(5));
            dataView.setUint32(1, len);
            dataView.setUint8(0, 0xdb);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else {
            throw new Error(
                'Cannot safely encode string with size larger than 32 bits',
            );
        }
        byteParts.push(encoded);
        return;
    }

    if (object instanceof Uint8Array) {
        if (object.length < EIGHT_BITS) { // bin 8
            byteParts.push(new Uint8Array([0xc4, object.length]));
        } else if (object.length < SIXTEEN_BITS) { // bin 16
            const dataView = new DataView(new ArrayBuffer(3));
            dataView.setUint16(1, object.length);
            dataView.setUint8(0, 0xc5);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else if (object.length < THIRTY_TWO_BITS) { // bin 32
            const dataView = new DataView(new ArrayBuffer(5));
            dataView.setUint32(1, object.length);
            dataView.setUint8(0, 0xc6);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else {
            throw new Error(
                'Cannot safely encode Uint8Array with size larger than 32 bits',
            );
        }
        byteParts.push(object);
        return;
    }

    if (Array.isArray(object)) {
        if (object.length < FOUR_BITS) { // fixarray
            byteParts.push(new Uint8Array([0x90 | object.length]));
        } else if (object.length < SIXTEEN_BITS) { // array 16
            const dataView = new DataView(new ArrayBuffer(3));
            dataView.setUint16(1, object.length);
            dataView.setUint8(0, 0xdc);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else if (object.length < THIRTY_TWO_BITS) { // array 32
            const dataView = new DataView(new ArrayBuffer(5));
            dataView.setUint32(1, object.length);
            dataView.setUint8(0, 0xdd);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else {
            throw new Error(
                'Cannot safely encode array with size larger than 32 bits',
            );
        }

        for (const obj of object) {
            encodeSlice(obj, byteParts);
        }
        return;
    }

    // If object is a plain object
    const prototype = Object.getPrototypeOf(object);

    if (prototype === null || prototype === Object.prototype) {
        const numKeys = Object.keys(object).length;

        if (numKeys < FOUR_BITS) { // fixarray
            byteParts.push(new Uint8Array([0x80 | numKeys]));
        } else if (numKeys < SIXTEEN_BITS) { // map 16
            const dataView = new DataView(new ArrayBuffer(3));
            dataView.setUint16(1, numKeys);
            dataView.setUint8(0, 0xde);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else if (numKeys < THIRTY_TWO_BITS) { // map 32
            const dataView = new DataView(new ArrayBuffer(5));
            dataView.setUint32(1, numKeys);
            dataView.setUint8(0, 0xdf);
            byteParts.push(new Uint8Array(dataView.buffer));
        } else {
            throw new Error('Cannot safely encode map with size larger than 32 bits');
        }

        for (const [key, value] of Object.entries(object)) {
            encodeSlice(key, byteParts);
            encodeSlice(value, byteParts);
        }
        return;
    }

    throw new Error('Cannot safely encode value into messagepack');
}

export function decode(data: Uint8Array): ValueType {
    const pointer = {consumed: 0};
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength,
    );
    const value = decodeSlice(data, dataView, pointer);

    if (pointer.consumed < data.length) {
        throw new EvalError('Messagepack decode did not consume whole array');
    }

    return value;
}

function decodeString(
    uint8: Uint8Array,
    size: number,
    pointer: { consumed: number },
) {
    pointer.consumed += size;
    const u8 = uint8.subarray(pointer.consumed - size, pointer.consumed);
    if (u8.length !== size) {
        throw new EvalError(
            'Messagepack decode reached end of array prematurely',
        );
    }
    return decoder.decode(u8);
}

function decodeArray(
    uint8: Uint8Array,
    dataView: DataView,
    size: number,
    pointer: { consumed: number },
) {
    const arr: ValueType[] = [];

    for (let i = 0; i < size; i++) {
        const value = decodeSlice(uint8, dataView, pointer);
        arr.push(value);
    }

    return arr;
}

function decodeMap(
    uint8: Uint8Array,
    dataView: DataView,
    size: number,
    pointer: { consumed: number },
) {
    const map: Record<number | string, ValueType> = {};

    for (let i = 0; i < size; i++) {
        const key = decodeSlice(uint8, dataView, pointer);
        const value = decodeSlice(uint8, dataView, pointer);

        if (typeof key !== 'number' && typeof key !== 'string') {
            throw new EvalError(
                'Cannot decode a key of a map: The type of key is invalid, keys must be a number or a string',
            );
        }

        map[key] = value;
    }

    return map;
}

const decoder = new TextDecoder();

const FIXMAP_BITS = 0b1000_0000;
const FIXMAP_MASK = 0b1111_0000;
const FIXARRAY_BITS = 0b1001_0000;
const FIXARRAY_MASK = 0b1111_0000;
const FIXSTR_BITS = 0b1010_0000;
const FIXSTR_MASK = 0b1110_0000;

function decodeSlice(
    uint8: Uint8Array,
    dataView: DataView,
    pointer: { consumed: number },
): ValueType {
    if (pointer.consumed >= uint8.length) {
        throw new EvalError('Messagepack decode reached end of array prematurely');
    }
    const type = dataView.getUint8(pointer.consumed);
    pointer.consumed++;

    if (type <= 0x7f) { // positive fixint - really small positive number
        return type;
    }

    if ((type & FIXMAP_MASK) === FIXMAP_BITS) { // fixmap - small map
        const size = type & ~FIXMAP_MASK;
        return decodeMap(uint8, dataView, size, pointer);
    }

    if ((type & FIXARRAY_MASK) === FIXARRAY_BITS) { // fixarray - small array
        const size = type & ~FIXARRAY_MASK;
        return decodeArray(uint8, dataView, size, pointer);
    }

    if ((type & FIXSTR_MASK) === FIXSTR_BITS) { // fixstr - small string
        const size = type & ~FIXSTR_MASK;
        return decodeString(uint8, size, pointer);
    }

    if (type >= 0xe0) { // negative fixint - really small negative number
        return type - 256;
    }

    switch (type) {
        case 0xc0: // nil
            return null;
        case 0xc1: // (never used)
            throw new Error(
                'Messagepack decode encountered a type that is never used',
            );
        case 0xc2: // false
            return false;
        case 0xc3: // true
            return true;
        case 0xc4: { // bin 8 - small Uint8Array
            if (pointer.consumed >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint8(pointer.consumed);
            pointer.consumed++;
            const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
            if (u8.length !== length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            pointer.consumed += length;
            return u8;
        }
        case 0xc5: { // bin 16 - medium Uint8Array
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint16(pointer.consumed);
            pointer.consumed += 2;
            const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
            if (u8.length !== length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            pointer.consumed += length;
            return u8;
        }
        case 0xc6: { // bin 32 - large Uint8Array
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint32(pointer.consumed);
            pointer.consumed += 4;
            const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
            if (u8.length !== length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            pointer.consumed += length;
            return u8;
        }
        case 0xc7: // ext 8 - small extension type
        case 0xc8: // ext 16 - medium extension type
        case 0xc9: // ext 32 - large extension type
            throw new Error(
                'Cannot decode a slice: Large extension type \'ext\' not implemented yet',
            );
        case 0xca: { // float 32
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getFloat32(pointer.consumed);
            pointer.consumed += 4;
            return value;
        }
        case 0xcb: { // float 64
            if (pointer.consumed + 7 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getFloat64(pointer.consumed);
            pointer.consumed += 8;
            return value;
        }
        case 0xcc: { // uint 8
            if (pointer.consumed >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getUint8(pointer.consumed);
            pointer.consumed += 1;
            return value;
        }
        case 0xcd: { // uint 16
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getUint16(pointer.consumed);
            pointer.consumed += 2;
            return value;
        }
        case 0xce: { // uint 32
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getUint32(pointer.consumed);
            pointer.consumed += 4;
            return value;
        }
        case 0xcf: { // uint 64
            if (pointer.consumed + 7 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getBigUint64(pointer.consumed);
            pointer.consumed += 8;
            return value;
        }
        case 0xd0: { // int 8
            if (pointer.consumed >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getInt8(pointer.consumed);
            pointer.consumed += 1;
            return value;
        }
        case 0xd1: { // int 16
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getInt16(pointer.consumed);
            pointer.consumed += 2;
            return value;
        }
        case 0xd2: { // int 32
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getInt32(pointer.consumed);
            pointer.consumed += 4;
            return value;
        }
        case 0xd3: { // int 64
            if (pointer.consumed + 7 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const value = dataView.getBigInt64(pointer.consumed);
            pointer.consumed += 8;
            return value;
        }
        case 0xd4: // fixext 1 - 1 byte extension type
        case 0xd5: // fixext 2 - 2 byte extension type
        case 0xd6: // fixext 4 - 4 byte extension type
        case 0xd7: // fixext 8 - 8 byte extension type
        case 0xd8: // fixext 16 - 16 byte extension type
            throw new Error('Cannot decode a slice: \'fixext\' not implemented yet');
        case 0xd9: { // str 8 - small string
            if (pointer.consumed >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint8(pointer.consumed);
            pointer.consumed += 1;
            return decodeString(uint8, length, pointer);
        }
        case 0xda: { // str 16 - medium string
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint16(pointer.consumed);
            pointer.consumed += 2;
            return decodeString(uint8, length, pointer);
        }
        case 0xdb: { // str 32 - large string
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint32(pointer.consumed);
            pointer.consumed += 4;
            return decodeString(uint8, length, pointer);
        }
        case 0xdc: { // array 16 - medium array
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint16(pointer.consumed);
            pointer.consumed += 2;
            return decodeArray(uint8, dataView, length, pointer);
        }
        case 0xdd: { // array 32 - large array
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint32(pointer.consumed);
            pointer.consumed += 4;
            return decodeArray(uint8, dataView, length, pointer);
        }
        case 0xde: { // map 16 - medium map
            if (pointer.consumed + 1 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint16(pointer.consumed);
            pointer.consumed += 2;
            return decodeMap(uint8, dataView, length, pointer);
        }
        case 0xdf: { // map 32 - large map
            if (pointer.consumed + 3 >= uint8.length) {
                throw new EvalError(
                    'Messagepack decode reached end of array prematurely',
                );
            }
            const length = dataView.getUint32(pointer.consumed);
            pointer.consumed += 4;
            return decodeMap(uint8, dataView, length, pointer);
        }
    }

    // All cases are covered for numbers between 0-255. Typescript isn't smart enough to know that.
    throw new Error('Unreachable');
}