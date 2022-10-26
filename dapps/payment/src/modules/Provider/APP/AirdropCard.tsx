import { Button } from 'antd';
import { showToast } from 'common/components/showPopup/Toast';
import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react';
import { CSVType } from 'payment/src/utils/types';
import { airdropCard } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { useBoundProviderStore } from 'payment/src/store';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
    templateId: string;
}

export default ({ address, templateId }: Props) => {
    const { fetch } = useBoundProviderStore((state) => state.subscription);
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;

        if (files) {
            Papa.parse(files[0], {
                complete: async (results) => {
                    try {
                        setLoading(true);
                        await airdropCard(results.data as CSVType, address as string, templateId);
                        setLoading(false);
                        showToast(`Airdrop success`, { type: 'success' });
                        address && fetch(address);
                    } catch (error) {
                        console.log('airdrop error: ', error);
                        setLoading(false);
                    }

                    e.target.value = '';
                },
                error(error) {
                    console.log('process csv file error: ', error);
                    showToast(`Process csv file error`, { type: 'failed' });
                    setLoading(false);
                },
            });
        }
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_CardAirdrop" type="primary" onClick={handleClick} loading={loading}>
                        Airdrop
                    </Button>
                )}
            />

            <input id="input_CardAirdrop" className="hidden" accept=".csv" type="file" onChange={handleChange} ref={inputRef}></input>
        </>
    );
};
