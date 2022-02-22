import React from 'react';
import Popper, { type Props } from '../Popper';

const Dropdown: React.FC<Props> = ({ children, placement = 'bottom', animationType = 'doorY', offset = [0, 4], arrow = false, trigger = 'click', interactive = true, ...props  }) => {
    return (
        <Popper
            placement={placement}
            animationType={animationType}
            offset={offset}
            arrow={arrow}
            trigger={'visible' in props ? undefined : trigger}
            interactive={interactive}
            {...props}
        >
            {children}
        </Popper>
    );
}

export default Dropdown;