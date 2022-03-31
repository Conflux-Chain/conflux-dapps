import ConfluxLogo from 'common/assets/Conflux.svg';
import CFXIcon from 'cross-space/src/assets/CFX.svg';
import TokenDefaultIcon from 'cross-space/src/assets/TokenDefaultIcon.png';

const config = {
    "1030": {
        "name": "Conflux eSpace",
        "url": "https://evm.confluxrpc.com",
        "networkId": "1030",
        "scan": "https://evm.confluxscan.net",
        "BridgeContractAddress": "0x6c421153f5d506d4d1b9d586c4b32b9185dbf593",
        "color": "#15C184",
        "logo": ConfluxLogo,
        "tokens": [{
            "name": "Conflux Network",
            "symbol": "CFX",
            "decimals": '18',
            "isNative": true,
            "icon": CFXIcon
        }, {
            "name": "Pegged Conflux",
            "symbol": "PeggedbCFX",
            "address": "0x43d2a9f6818a30cfd6251262d619dff0e7bc105d",
            "decimals": '18',
            "icon": TokenDefaultIcon
        }],
        "chains": [{
            "name": "Binance Smart Chain",
            "url": "https://bsc-dataseed.binance.org/",
            "networkId": "56",
            "scan": "https://bscscan.com",
            "BridgeContractAddress": "0xe1fab6d373fabcb16fb092deadf17cc20b196cb5",
            "color": "#F3BA2F",
            "logo": "https://bin.bnbstatic.com/static/images/common/logo.png",
            "tokens": [{
                "name": "BSC Conflux",
                "symbol": "bCFX",
                "address": "0xef3f743830078a9cb5ce39c212ec1ca807e45fe1",
                "decimals": '18',
                "icon": CFXIcon
            }, {
                "name": "Pegged BSC Conflux",
                "symbol": "PeggedbCFX",
                "address": "0xb7cd26c41bd8b120735273150b5255377ba1978f",
                "decimals": '18',
                "icon": TokenDefaultIcon
            }]
        }]
    },
    "71": {
        "name": "Conflux eSpace (Testnet)",
        "url": "https://evmtestnet.confluxrpc.com",
        "networkId": "71",
        "scan": "https://evmtestnet.confluxscan.net",
        "BridgeContractAddress": "0x6c421153f5d506d4d1b9d586c4b32b9185dbf593",
        "color": "#15C184",
        "logo": ConfluxLogo,
        "tokens": [{
            "name": "Conflux Network",
            "symbol": "CFX",
            "decimals": '18',
            "isNative": true,
            "icon": CFXIcon
        }, {
            "name": "Pegged Conflux",
            "symbol": "PeggedCFX",
            "address": "0x43d2a9f6818a30cfd6251262d619dff0e7bc105d",
            "decimals": '18',
            "icon": TokenDefaultIcon
        }],
        "chains": [{
            "name": "BSC (Testnet)",
            "url": "https://data-seed-prebsc-1-s1.binance.org:8545/",
            "networkId": "97",
            "scan": "https://testnet.bscscan.com",
            "BridgeContractAddress": "0xe1fab6d373fabcb16fb092deadf17cc20b196cb5",
            "color": "#F3BA2F",
            "logo": "https://bin.bnbstatic.com/static/images/common/logo.png",
            "tokens": [{
                "name": "BSC Conflux",
                "symbol": "bCFX",
                "address": "0xef3f743830078a9cb5ce39c212ec1ca807e45fe1",
                "decimals": '18',
                "icon": CFXIcon
            }, {
                "name": "Pegged BSC Conflux",
                "symbol": "PeggedbCFX",
                "address": "0xb7cd26c41bd8b120735273150b5255377ba1978f",
                "decimals": '18',
                "icon": TokenDefaultIcon
            }]
        }]
    }
}

export default config;