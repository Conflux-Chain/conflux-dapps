import { Button } from 'antd';
import { showToast } from 'common/components/showPopup/Toast';
import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react';
import { CSVType } from 'payment/src/utils/types';
import { airdrop } from 'payment/src/utils/request';
import { useParams } from 'react-router-dom';
import { AuthESpace } from 'common/modules/AuthConnectButton';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: () => void;
    address: string;
}

export default ({ onComplete, address }: Props) => {
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
                        await airdrop(results.data as CSVType, address);
                        setLoading(false);
                        showToast(`Airdrop success`, { type: 'success' });
                        onComplete && onComplete();
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
        <div>
            <AuthESpace
                className="!rounded-sm"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_createAPP" type="primary" onClick={handleClick} loading={loading}>
                        Airdrop
                    </Button>
                )}
            />

            <input id="input_airdrop" className="hidden" accept=".csv" type="file" onChange={handleChange} ref={inputRef}></input>
        </div>
    );
};
