import { cloneElement, CSSProperties, HTMLAttributes, useRef } from 'react';
import { a, useTransition } from '@react-spring/web';
import cx from 'clsx';
import { transitionAnimation, TransitionAnimationType } from '../Animation';
type OverWrite<T, U> = Omit<T, keyof U> & U;

export interface ItemProps {
    key?: string | number;
    animationType?: TransitionAnimationType;
    animationDuration?: number | { enter: number; leave: number };
    ItemWrapperClassName?: string;
    ItemWrapperStyle?: CSSProperties;
    [other: string]: any;
}

export type Props<T> = OverWrite<
    HTMLAttributes<HTMLDivElement>,
    {
        list: T[];
        mainDirection?: 'x' | 'y';
        itemKey?: string;
        children: (item: T, index: number) => JSX.Element;
        animatedSize?: boolean;
        animationType?: TransitionAnimationType;
        animationDuration?: number | { enter: number; leave: number };
        ItemWrapperClassName?: string;
        ItemWrapperStyle?: CSSProperties;
    }
>;

const List = <T extends ItemProps>({
    list,
    itemKey,
    mainDirection = 'y',
    children,
    animatedSize,
    animationType = 'zoom',
    animationDuration,
    ItemWrapperClassName,
    ItemWrapperStyle,
    ...props
}: Props<T>) => {
    const mainSizeType = mainDirection === 'x' ? 'width' : 'height';
    const mainSizeMap = useRef(new WeakMap());
    
    const render = useTransition(list, {
        keys: (item: T) => item.key ?? ((item as any)[itemKey as string]) as string,
        initial: (item: T) => ({
            [mainSizeType]: undefined,
        }),
        from: (item: T) => ({
            ...transitionAnimation[item?.animationType ?? animationType].from,
            [mainSizeType]: animatedSize ? 0 : undefined,
        }),
        enter: (item: T) => async (next) =>
            await next({
                ...transitionAnimation[item?.animationType ?? animationType].enter,
                [mainSizeType]: animatedSize ? mainSizeMap.current.get(item) : undefined,
                config: {
                    ...transitionAnimation[item?.animationType ?? animationType].enter?.config,
                    duration:
                        typeof (item?.animationDuration ?? animationDuration) === 'object'
                            ? ((item?.animationDuration ?? animationDuration) as {
                                    enter: number;
                                    leave: number;
                            })?.enter
                            : item?.animationDuration ?? animationDuration,
                },
            }),
        leave: (item: T) => ({
            ...transitionAnimation[item?.animationType ?? animationType].leave,
            [mainSizeType]: animatedSize ? 0 : undefined,
            margin: 0,
            overflow: 'hidden',
            config: {
                ...transitionAnimation[item?.animationType ?? animationType].leave?.config,
                duration:
                    typeof (item?.animationDuration ?? animationDuration) === 'object'
                        ? ((item?.animationDuration ?? animationDuration) as {
                                enter: number;
                                leave: number;
                        })?.leave
                        : item?.animationDuration ?? animationDuration,
            },
        }),
    });
    
    return (
        <div {...props}>
            {render((style, item, _, index) => (
                <a.div
                    className={cx(
                        'bg-transparent origin-center overflow-visible backface-visible',
                        mainSizeType === 'width' ? 'h-fit will-change-[width]' : 'w-fit will-change-[height]',
                        item?.ItemWrapperClassName ?? ItemWrapperClassName
                    )}
                    style={{ ...(item?.ItemWrapperStyle ?? ItemWrapperStyle), ...style }}
                >
                    {animatedSize ? (
                        <a.div
                            className={cx('w-fit h-fit', mainSizeType === 'width' ? 'will-change-[width]' : 'will-change-[height]')}
                            ref={(r: HTMLDivElement) => mainSizeMap.current?.set(item, r?.[mainDirection === 'x' ? 'clientWidth' : 'offsetHeight'])}
                        >
                            {cloneElement(children(item, index))}
                        </a.div>
                    ) : (
                        cloneElement(children(item, index))
                    )}
                </a.div>
            ))}
        </div>
    );
};

export default List;
