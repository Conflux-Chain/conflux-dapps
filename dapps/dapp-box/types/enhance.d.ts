/**
 * Get the keys of T without any keys of U.
 */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Restrict using either exclusively the keys of T or exclusively the keys of U.
 *
 * No unique keys of T can be used simultaneously with any unique keys of U.
 *
 * @example const myVar: XOR<T, U>
 */
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

/**
 * OverWrite common keys of T and U in T, and add extra keys of U to key.
 */
type OverWrite<T, U> = Omit<T, keyof U> & U;

/**
 * Same as OverWrite, and omit keys extends J.
 */
type OverWriteOmit<T, U, J extends string> = Omit<T, keyof U | J> & U;

/**
 * Get the keys of Union type;
 */
type KeysOfUnion<T> = T extends any ? keyof T : null;

/**
 * Get one of T's field(key: value).
 */
type EitherField<T, TKey extends keyof T = keyof T> = TKey extends keyof T
    ? { [P in TKey]-?: T[TKey] } & Partial<Record<Exclude<keyof T, TKey>, never>>
    : never;

type ValueOf<T> = T[keyof T];

type PartialOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type PartialOmit<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
type RequiredOptional<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type RequiredOmit<T, K extends keyof T> = Pick<T, K> & Required<Omit<T, K>>;
