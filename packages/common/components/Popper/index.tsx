import React, { useCallback, type CSSProperties } from 'react';
import cx from 'clsx';
import { useSpring, a } from "@react-spring/web";
import { transitionAnimation, TransitionAnimationType } from '../Animation';
import Tippy, { type TippyProps } from '@tippyjs/react/headless';
import './index.css';

interface PropsEnhance {
    Content: React.ReactNode | Function;
    children?: React.ReactElement<any>;
    className?: string;
    style?: CSSProperties;
    arrow?: boolean;
    animationType?: TransitionAnimationType;
    animationDuration?: number | { enter: number, leave: number };
}

export type Props = PropsEnhance & TippyProps;

const Popper: React.FC<Props> = ({
    children,
    Content,
    className,
    style,
    arrow,
    animation,
    animationType = 'zoom',
    animationDuration,
    ...props
}) => {
    const [styles, api] = useSpring(() => transitionAnimation[animationType].from);

    const onMount = useCallback(() => {
        api.start({ ...transitionAnimation[animationType].enter, config: { mass: 1, tension: 400, friction: 22, clamp: false, duration: typeof animationDuration === 'number' ? animationDuration : animationDuration?.enter }, onRest: () => {} });
    }, [animationType, animationDuration]);

    const onHide = useCallback(({ unmount }: { unmount: VoidFunction}) => {
        api.start({ ...transitionAnimation[animationType].leave, onRest: unmount, config: { mass: 1, tension: 400, friction: 24, clamp: true, duration: typeof animationDuration === 'number' ? animationDuration : animationDuration?.leave } });
    }, [animationType, animationDuration]);


    return (
        <Tippy
            render={(attrs) => (
                <a.div
                    className={
                        className ? cx(className, 'popper') : 
                        (typeof Content !== 'string' &&
                        typeof Content !== 'number' &&
                        typeof Content !== 'boolean') ? 'popper popper--custom' : 'popper popper--default'
                }
                    style={{ ...style, ...styles }}
                    {...attrs}
                >
                    {typeof Content === 'function' ? <Content /> : Content}
                    {arrow && <div data-popper-arrow className="popper-arrow" />}
                </a.div>
            )}
            {...props}
            animation={true}
            onMount={onMount}
            onHide={onHide}
        >
            {children}
        </Tippy>
    );
};

export default Popper;
