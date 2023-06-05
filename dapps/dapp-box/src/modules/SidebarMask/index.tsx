import { changeExpand, useExpand } from '../Sidebar/sideBarStore';
import { useEffect, type HTMLAttributes } from 'react';
import { a, useTransition } from '@react-spring/web';
import classNames from 'clsx';
import { lock, clearBodyLocks } from 'common/utils/body-scroll-lock/index';

export const SideBarMask = () => {
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    const expand = useExpand();
    return (
        <div className="z-8">
            <Mask open={expand && isMobile()} />
        </div>
    );
};

type OverWrite<T, U> = Omit<T, keyof U> & U;

export type Props = OverWrite<
    HTMLAttributes<HTMLDivElement>,
    {
        open: boolean;
    }
>;

const Mask = ({ open, className, style, ...props }: Props) => {
    const transitions = useTransition(open, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        reverse: open,
    });

    useEffect(() => {
        if (open) lock();
        else clearBodyLocks();
    }, [open]);

    return transitions(
        (styles, item) =>
            item && (
                <a.div
                    className={classNames('fixed left-0 top-0 w-full h-full bg-black bg-opacity-40 z-10 contain-strict', className)}
                    style={{ ...style, ...styles }}
                    {...props}
                    onClick={changeExpand}
                />
            )
    );
};

export default Mask;
