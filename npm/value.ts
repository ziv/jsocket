/**
 * @see https://jsr.io/@std/msgpack/1.0.2/encode.ts#L9
 */
export type ValueType =
    | number
    | bigint
    | string
    | boolean
    | null
    | Uint8Array
    | readonly ValueType[]
    | ValueMap;

/**
 * @see https://jsr.io/@std/msgpack/1.0.2/encode.ts#L22
 */
export interface ValueMap {
    [index: string | number]: ValueType;
}