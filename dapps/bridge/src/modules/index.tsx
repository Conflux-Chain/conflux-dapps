import React from 'react';
import cx from 'clsx';
import {
    map,
    useData,
    useSourceChain,
    useSourceChains,
    useDestinationChain,
    useDestinationChains,
    useToken,
    useTokens,
    handleSourceChainChange,
    handleDestinationChainChange,
    handleTokenChange,
    handleReverse,
    afterSpaceBridge,
    createHref,
} from './data';
import Select from '../components/Select';
import TurnPage from 'cross-space/src/assets/turn-page.svg';
import Button from 'common/components/Button';

const renderToken = (token: string) => (
    <div className="flex items-center">
        <img
            className="mr-[8px] w-[28px] h-[28px]"
            src={map.tokensIcon[token] ?? 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png'}
            alt=""
        />
        {token}
    </div>
);
const renderChain = (chain: string) => (
    <div className="flex items-center">
        <img className="mr-[8px] w-[28px] h-[28px]" src={map.chainsIcon[chain]} alt="" />
        {chain}
    </div>
);

const Index: React.FC = () => {
    const sourceChain = useSourceChain()!;
    const sourceChains = useSourceChains()!;
    const destinationChain = useDestinationChain()!;
    const destinationChains = useDestinationChains()!;
    const token = useToken()!;
    const tokens = useTokens()!;

    if (!sourceChain) return <div>loading...</div>;
    return (
        <div className="cross-space-module mx-auto mt-[16px] mb-[24px]">
            <Chain title="Source" current={sourceChain} chains={sourceChains} handleSelect={handleSourceChainChange} />
            <Chain title="Destination" current={destinationChain} chains={destinationChains} handleSelect={handleDestinationChainChange} />

            <div className="mb-[6px] text-[13px] text-[#898D9A]">Asset</div>
            <Select className="bg-[#F7F8FA]" current={token} data={tokens} renderItem={renderToken} onSelect={handleTokenChange} />

            <button
                id="bridge-reverse"
                className="absolute left-1/2 top-[100px] -translate-x-1/2 rotate-90 turn-page flex justify-center items-center w-[32px] h-[32px] rounded-full bg-white cursor-pointer transition-transform hover:scale-105"
                onClick={handleReverse}
                type="button"
            >
                <img src={TurnPage} alt="turn page" className="w-[14px] h-[14px]" draggable="false" />
            </button>

            {sourceChain && <Routes />}
        </div>
    );
};

const Chain: React.FC<{ title: string; current: string; chains: Array<string>; handleSelect: (chain: string) => void }> = ({
    title,
    current,
    chains,
    handleSelect,
}) => {
    return (
        <div className="mb-[16px] rounded-[8px] border border-[#EAECEF]">
            <div className="ml-[12px] mt-[16px] text-[12px] text-[#898D9A]">{title}</div>
            <Select className="!border-none" current={current} data={chains} renderItem={renderChain} onSelect={handleSelect} />
        </div>
    );
};

const Routes: React.FC = () => {
    const data = useData();
    const sourceChain = useSourceChain()!;
    const destinationChain = useDestinationChain()!;
    const token = useToken()!;

    const routes = data?.[sourceChain]?.[destinationChain]?.[token];

    return (
        <>
            <div className="mt-[24px] mb-[6px] text-[13px] text-[#898D9A] font-normal">Recommended Route</div>
            <div className="flex flex-col gap-[16px]">
                {routes?.map?.((route: string | Array<string>, index: number) => (
                    <div
                        className={cx(
                            'relative flex flex-col gap-[16px] px-[12px] py-[16px] rounded-[4px] border border-[#EAECEF] bg-[#FAFBFD] overflow-hidden',
                            routes.length > 1 && index === 0 && 'pt-[42px]'
                        )}
                        key={index}
                    >
                        {routes.length > 1 && index === 0 && (
                            <span className="absolute left-0 top-0 w-fit rounded-br-[4px] px-[10px] py-[4px] text-[12px] text-[#808BE7] font-medium bg-[#F0F3FF]">
                                Low gas fee
                            </span>
                        )}
                        {(Array.isArray(route) ? route : [route])?.map((eachRoute, index) => {
                            const _sourceChain =
                                Array.isArray(route) && index !== 0 ? afterSpaceBridge({ sourceChain, destinationChain }) : sourceChain;
                            const _destinationChain = Array.isArray(route) && index !== route.length - 1
                                ? afterSpaceBridge({ sourceChain, destinationChain })
                                : destinationChain;
                            const href = createHref({ sourceChain: _sourceChain, destinationChain: _destinationChain, token, route: eachRoute });
                            return (
                                <div className="flex items-center whitespace-nowrap" key={eachRoute}>
                                    <div className="text-center text-[12px] text-[#3D3F4C] w-[80px]">
                                        <img className="mx-auto mb-[8px] w-[28px] h-[28px]" src={map.chainsIcon[_sourceChain]} alt="" />
                                        {_sourceChain}
                                    </div>
                                    <div className="w-[40px] h-0 border border-[#A9ABB2] border-dashed -translate-y-[12px]" />

                                    <div className="mx-[12px] text-center text-[12px] text-[#3D3F4C]">
                                        <img
                                            className="mx-auto mb-[8px] w-[28px] h-[28px]"
                                            src={map.tokensIcon[token] ?? 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png'}
                                            alt=""
                                        />
                                        {token}
                                    </div>

                                    <div className="w-[40px] h-0 border border-[#A9ABB2] border-dashed -translate-y-[12px]" />

                                    <div className="text-center text-[12px] text-[#3D3F4C] w-[80px]">
                                        <img className="mx-auto mb-[8px] w-[28px] h-[28px]" src={map.chainsIcon[_destinationChain]} alt="" />
                                        {_destinationChain}
                                    </div>

                                    <Button
                                        className="ml-auto min-w-[100px]"
                                        size="small"
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        disabled={!href}
                                    >
                                        {eachRoute}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Index;
