import React from 'react';
import cx from 'clsx';
import MathTexRate from 'governance/src/assets/MathTexRate.svg';
import MathTexReward from 'governance/src/assets/MathTexReward.svg';

const MathTex: React.FC<{ className?: string; type?: 'reward' | 'rate' }> = ({ className, type = 'rate' }) => {
    return (
        <img src={type === 'rate' ? MathTexRate : MathTexReward} className={cx(className, 'inline-block w-[314px] h-[29px]')} alt="MathTex" draggable="false" />
    );
};

export default MathTex;
