import React from 'react';
import Popper, { type Props } from '../Popper';

const ToolTip: React.FC<Omit<Props, 'Content'> & { text?: string; }> = ({ children, text, placement = 'top', animationType = 'zoom', arrow = true, interactive = true, delay = 180, ...props  }) => {
    return (
        <Popper
            placement={placement}
            animationType={animationType}
            arrow={arrow}
            Content={text}
            delay={delay}
            {...props}
        >
            {children}
        </Popper>
    );
}

export default ToolTip;