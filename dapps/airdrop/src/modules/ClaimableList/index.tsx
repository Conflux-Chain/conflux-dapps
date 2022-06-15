import React, { useCallback, useState, memo } from 'react';
import { watchAsset, Unit } from '@cfxjs/use-wallet-react/ethereum'
import { shortenAddress } from 'common/utils/addressUtils';
import List from 'common/components/List';
import Tooltip from 'common/components/Tooltip';
import { useTokenList, type Token } from 'airdrop/src/store';
import Networks from 'common/conf/Networks';
import Add from 'common/assets/icons/add-to-wallet.svg';
import Open from 'cross-space/src/assets/open.svg';
import BalanceText from 'common/modules/BalanceText';
import Button from 'common/components/Button';
import { handleClaim } from './handleCliam';
import './index.css';

const ClaimableList: React.FC = () => {
    const tokenList = useTokenList();

    return (
        <List
            id="airdrop-claimable-list"
            className="flex flex-col"
            list={tokenList}
            itemKey="eSpace_address"
            ItemWrapperClassName="airdrop-claimable-token"
            animatedSize
            animationType='slideRight'
        >
            {(token) => 
                <TokenItem {...token} />
            }
        </List>
    );
}

const TokenItem = memo<Token & { balance?: Unit; trackChangeOnce: (cb: () => void) => void; }>(({ children, ...token}) => {
    const { eSpace_address, name, symbol, icon, balance, decimals } = token;
    const [inClaiming, setInClaiming] = useState(false);
    const handleClickAddToWallet = useCallback<React.MouseEventHandler<HTMLImageElement>>(async (evt) => {
        evt.stopPropagation();
        try {
            await (watchAsset)({
                type: 'ERC20',
                options: {
                    address: eSpace_address,
                    symbol: symbol,
                    decimals: token.decimals
                },
            });
        } catch (err) {
            console.error((`Add ${symbol} to MetaMask failed!`));
        }
    }, []);

    return (
        <div
            className="relative flex justify-between items-center h-[56px] gap-[40px]"
        >
            <div className="flex items-center w-[200px]">
                <img src={icon} alt="token img" className="w-[28px] h-[28px] mr-[8px]" />

                <div className='h-[36px]'>
                    <p className='text-[14px] text-[#3D3F4C]'>{symbol}</p>
                    <p className='text-[12px] text-[#A9ABB2]'>{name}</p>
                </div>
            </div>

            <div className='w-[160px]'>
                <p className='text-[14px] text-[#3D3F4C]'>Claimable</p>
                <BalanceText className="text-[12px] text-[#A9ABB2]" balance={balance} symbol={symbol} decimals={+decimals} />
            </div>
            
            <Button
                className="min-w-[60px]"
                variant='outlined'
                size="small"
                loading={inClaiming}
                disabled={!balance || balance?.toDecimalMinUnit() === '0'}
                onClick={() => handleClaim(token, setInClaiming)}
            >
                Claim
            </Button>

            <div className='flex items-center'>
                <span className='text-[12px] text-[#808BE7]'>{shortenAddress(eSpace_address)}</span>
                <Tooltip text="Add to MetaMask">
                    <img src={Add} alt="add image" className='ml-[8px] w-[16px] h-[16px] cursor-pointer' onClick={handleClickAddToWallet}/>
                </Tooltip>
                <Tooltip text="View in Scan">
                    <a href={`${Networks.eSpace.blockExplorerUrls[0]}/token/${eSpace_address}`} target="_blank" rel="noopener">
                        <img src={Open} alt="open image" className='ml-[8px] w-[18px] h-[18px] cursor-pointer' />
                    </a>
                </Tooltip>
            </div>
        </div>
    );
});

export default ClaimableList;