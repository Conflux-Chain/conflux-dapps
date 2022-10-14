import Title from 'payment/src/components/Title';
import { useParams, useLocation } from 'react-router-dom';
import { default as BillingInfo } from 'payment/src/modules/Provider/APP/BillingSettings';
import Detail from 'payment/src/modules/Common/APP/Detail';
import SubscriptionInfo from './SubscriptionInfo';
import { useMemo } from 'react';

export default () => {
    const { address, type } = useParams();
    const { state } = useLocation();

    const info = useMemo(() => {
        if (address && type) {
            if (type === 'subscription') {
                return <SubscriptionInfo address={address as string} />;
            } else if (type === 'billing') {
                return <BillingInfo address={address as string} />;
            } else {
                return <>no such type app</>;
            }
        } else {
            return null;
        }
    }, [address, type]);

    return (
        <div>
            <Title backTo={`/payment/consumer/${(state as { from: string })?.from || 'apps'}`}>Detail</Title>
            <Detail address={address as string} />
            {info}
        </div>
    );
};
