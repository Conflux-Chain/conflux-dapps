import React from "react";
import cx from 'clsx';
import './index.css';

export interface SwitchProps {
    checked: boolean;
    onChange: () => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
    return (
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            className={cx(
                'switch',
                checked && 'switch-checked',
                !checked && 'switch-unchecked'
            )}
        />
    )
}

export default Switch;