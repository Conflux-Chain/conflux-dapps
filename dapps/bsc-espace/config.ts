import ConfluxLogo from 'common/assets/chains/Conflux.svg';
import CFXIcon from 'cross-space/src/assets/CFX.svg';
import BSCIcon from 'bsc-espace/src/assets/BSC.svg';
import ETHIcon from 'bsc-espace/src/assets/ETH.svg';
import TokenDefaultIcon from 'cross-space/src/assets/TokenDefaultIcon.png';
import Networks from 'common/conf/Networks';
import { isProduction } from 'common/conf/Networks';

const Config = {
    network: Networks.eSpace,
    serverUrl: isProduction ? 'https://ebridge.shuttleflow.io/' : 'https://ebridge-testnet.shuttleflow.io/',
    BridgeContractAddress: isProduction ? '0xf55460b8bc81ea65d7ae0aea2383ef69c8f2c62e' : '0x6c421153f5d506d4d1b9d586c4b32b9185dbf593',
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
                address: isProduction ? '0x5ce35e15080737671799911a300f112221406bb5' : '0x43d2a9f6818a30cfd6251262d619dff0e7bc105d',
                decimals: 18,
                icon: TokenDefaultIcon,
                isPeggedToken: true,
            },
        },
    ],
    chains: [
        {
            network: Networks.bsc,
            BridgeContractAddress: isProduction ? '0xf55460b8bc81ea65d7ae0aea2383ef69c8f2c62e' : '0xe1fab6d373fabcb16fb092deadf17cc20b196cb5',
            color: '#F3BA2F',
            logo: BSCIcon,
            tokens: [
                {
                    name: 'BSC Conflux',
                    symbol: 'bCFX',
                    address: isProduction ? '0x045c4324039dA91c52C55DF5D785385Aab073DcF' : '0xef3f743830078a9cb5ce39c212ec1ca807e45fe1',
                    decimals: 18,
                    icon: CFXIcon,
                    PeggedToken: {
                        name: 'Pegged BSC Conflux',
                        symbol: 'PeggedbCFX',
                        address: isProduction ? '0x5ce35e15080737671799911a300f112221406bb5' : '0xb7cd26c41bd8b120735273150b5255377ba1978f',
                        decimals: 18,
                        icon: TokenDefaultIcon,
                        isPeggedToken: true,
                    },
                },
            ],
        },
        {
            network: Networks.etc,
            BridgeContractAddress: isProduction ? '0xefbda757bd6ebb7229df41a609cd69ae028b5c30' : '0xefbda757bd6ebb7229df41a609cd69ae028b5c30',
            color: '#F3BA2F',
            logo: ETHIcon,
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
