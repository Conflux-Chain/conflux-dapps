import ConfluxLogo from 'common/assets/chains/Conflux.svg';
import CFXIcon from 'cross-space/src/assets/CFX.svg';
import TokenDefaultIcon from 'cross-space/src/assets/TokenDefaultIcon.png';
import Networks from 'common/conf/Networks';
import { isProduction } from 'common/conf/Networks';

const Config = {
    network: Networks.eSpace,
    serverUrl: isProduction ? 'https://ebridge.shuttleflow.io/' : 'https://ebridge-testnet.shuttleflow.io/',
    BridgeContractAddress: isProduction ? '0x6c421153f5d506d4d1b9d586c4b32b9185dbf593' : '0x6c421153f5d506d4d1b9d586c4b32b9185dbf593',
    color: '#15C184',
    logo: ConfluxLogo,
    tokens: [
        {
            name: 'Conflux Network',
            symbol: 'CFX',
            decimals: 18,
            isNative: true,
            address: '0x0000000000000000000000000000000000000001',
            icon: CFXIcon,
            PeggedToken: {
                name: 'Pegged Conflux',
                symbol: 'PeggedCFX',
                address: isProduction ? '0xc5649e95ee07d07307f69af292d1c74c52165444' : '0xc5649e95ee07d07307f69af292d1c74c52165444',
                decimals: 18,
                icon: TokenDefaultIcon,
                isPeggedToken: true,
            },
        },
    ],
    chains: [
        {
            network: Networks.etc,
            BridgeContractAddress: isProduction ? '0xefbda757bd6ebb7229df41a609cd69ae028b5c30' : '0xefbda757bd6ebb7229df41a609cd69ae028b5c30',
            color: '#F3BA2F',
            logo: 'https://bin.bnbstatic.com/static/images/common/logo.png',
            tokens: [
                {
                    name: 'Ethereum Classic',
                    symbol: 'ETC',
                    isNative: true,
                    address: '0x0000000000000000000000000000000000000002',
                    decimals: 18,
                    icon: CFXIcon,
                    PeggedToken: {
                        name: 'Pegged Ethereum Classic',
                        symbol: 'PeggedETC',
                        address: isProduction ? '0xaA0980712Ff3d302d8926A33959eA009326B921c' : '0xaA0980712Ff3d302d8926A33959eA009326B921c',
                        decimals: 18,
                        icon: TokenDefaultIcon,
                        isPeggedToken: true,
                    },
                },
            ],
        },
    ],
};

export default Config;
