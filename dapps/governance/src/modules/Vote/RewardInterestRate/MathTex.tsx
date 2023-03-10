import React from 'react';

const MathTex: React.FC<{ type: 'reward' | 'rate' | 'result' }> = ({ type = 'rate' }) => {
    return <span className='font-bold'>{''} Precious {type.charAt(0).toUpperCase() + type.slice(1)} * 2 ^ ((Increase - Decrease) / (Increase + Decease + Unchange))</span>
};

export default MathTex;
