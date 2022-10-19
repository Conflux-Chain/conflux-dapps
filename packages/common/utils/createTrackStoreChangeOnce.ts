import { type UseBoundStore, type StoreApi } from 'zustand';

type Write<T extends object, U extends object> = Omit<T, keyof U> & U;
type StoreSubscribeWithSelector<T extends Object> = {
    subscribe: {
        (listener: (selectedState: T, previousSelectedState: T) => void): () => void;
        <U>(
            selector: (state: T) => U,
            listener: (selectedState: U, previousSelectedState: U) => void,
            options?: {
                equalityFn?: (a: U, b: U) => boolean;
                fireImmediately?: boolean;
            }
        ): () => void;
    };
};

type Store<T extends Object> = UseBoundStore<Write<StoreApi<T>, StoreSubscribeWithSelector<T>>>;

const createTrackStoreChangeOnce =
    <S, T extends Store<S>>(store: T, trackValueName: keyof S) =>
    (callback: (trackValue: S[keyof S]) => void) => {
        let unsubTrack: VoidFunction | null = null;

        unsubTrack = store.subscribe(
            (state) => state[trackValueName],
            (trackValue) => {
                callback?.(trackValue);
                if (unsubTrack) {
                    unsubTrack();
                    unsubTrack = null;
                }
            }
        );
    };

export default createTrackStoreChangeOnce;
