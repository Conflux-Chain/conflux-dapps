import type { Ref } from 'react';

export default function composeRef<T>(refs: Ref<T>[]): (ref: T) => void;
export default function composeRef<T>(...refs: Ref<T>[]): (ref: T) => void;
export default function composeRef<T>() {
    let refs: Ref<T>[];
    if (arguments.length === 1 && arguments[0] instanceof Array) refs = arguments[0];
    else refs = Array.from(arguments);
    return (ref: T) => {
        refs.forEach((r) => {
            if (r !== null && typeof r === 'object' && 'current' in r) (r as any).current = ref;
            if (typeof r === 'function') r(ref);
        });
    };
}
