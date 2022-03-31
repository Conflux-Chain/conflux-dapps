import React from 'react';
import NoClaimBg from 'espace-bridge/src/assets/no-claim-bg.png';

const Claim: React.FC = () => {
    return (
        <img className="w-full h-[228px]" src={NoClaimBg} alt="pending txn will appear here" />
    )
}

export default Claim;