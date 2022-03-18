import React from 'react';
import { Link } from 'react-router-dom';

const ShuttleFlowEnhance: React.FC = () => {
    return (
        <div className='ml-[32px] inline-flex items-center gap-[24px] text-[16px] text-[#898D9A]'>
            <Link to='shuttle-flow'>App</Link>
            <Link to='shuttle-flow/history'>History</Link>
        </div>
    );
}

export default ShuttleFlowEnhance;