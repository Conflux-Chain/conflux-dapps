import React from 'react';
import cx from 'clsx';
import MathTexRate from 'governance/src/assets/MathTexRate.png';
import MathTexReward from 'governance/src/assets/MathTexReward.png';
import MathTexResult from 'governance/src/assets/MathTexResult.png';

const MathTex: React.FC<{ className?: string; type: 'reward' | 'rate' | 'result' }> = ({ className, type = 'rate' }) => {
    return (
        <img
            src={type === 'rate' ? MathTexRate : type === 'reward' ? MathTexReward : MathTexResult}
            className={cx(className, 'inline-block w-[252px] h-[29px]')}
            alt="MathTex"
            draggable="false"
        />
    );
};

export default MathTex;
