import { useMemo, useState, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import { useParams, useLocation } from 'react-router-dom';
import { TitleType } from 'payment/src/utils/types';
import BillingSettings from './BillingSettings';
import SubscriptionSettings from './SubscriptionSettings';
import APPSettings from './APPSettings';
import { useFrom } from 'payment/src/utils/hooks';

export default () => {
    const { address, type } = useParams();
    const { state } = useLocation();
    const from = useFrom();
    const [APPType, setAPPType] = useState(type);

    const handleTitleClick = (type: Pick<TitleType, 'key' | 'text'>) => setAPPType(type as string);

    const config: TitleType[] = useMemo(
        () => [
            {
                text: type === 'billing' ? 'Billing Settings' : 'Subscription Settings',
                key: type,
                onClick: handleTitleClick,
                active: APPType === type,
            },
            {
                text: 'APP settings',
                active: APPType === 'app',
                key: 'app',
                onClick: handleTitleClick,
            },
        ],
        [APPType]
    );

    const getSetting = useCallback(() => {
        if (address) {
            if (APPType === 'billing') {
                return <BillingSettings address={address} />;
            } else if (APPType === 'subscription') {
                return <SubscriptionSettings address={address} />;
            } else {
                return <APPSettings address={address} />;
            }
        } else {
            return null;
        }
    }, [APPType, address]);

    return (
        <div>
            <Title config={config} backTo={`/payment/${from}/${(state as { from: string })?.from || 'apps'}`}></Title>
            {getSetting()}
        </div>
    );
};
