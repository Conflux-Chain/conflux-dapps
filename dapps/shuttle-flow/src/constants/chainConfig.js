// chain config constants
import React from 'react'
import PropTypes from 'prop-types'

import {IS_DEV} from '../utils'
import {
  checkHexAddress,
  checkCfxTokenAddress,
  checkBtcAddress,
} from '../utils/address'
import {
  ChainBscLogo,
  ChainBtcLogo,
  ChainEthLogo,
  ChainCfxLogo,
  ChainOecLogo,
  ChainHecoLogo,
  MetamaskLogo,
  FluentLogo,
} from '../assets/svg'

/**
 * ethereum config
 */
export const KeyOfEth = 'eth'
export const ScanUrlEth = IS_DEV
  ? 'https://rinkeby.etherscan.io'
  : 'https://etherscan.io'
export const ChainIdsEth = {
  MAINNET: {id: 1, name: 'Mainnet'},
  TESTNET: {id: 4, name: 'Rinkeby'}, // shuttle use Rinkeby network as testnet
  // ROPSTEN: 3,
  // GÖRLI: 5,
  // KOVAN: 42,
}

/**
 * bsc config
 */
export const KeyOfBsc = 'bsc'
export const ScanUrlBsc = IS_DEV
  ? 'https://testnet.bscscan.com'
  : 'https://bscscan.com'
export const ChainIdsBsc = {
  MAINNET: {id: 56, name: 'Mainnet'},
  TESTNET: {id: 97, name: 'Testnet'},
}

/**
 * oec config
 */

export const KeyOfOec = 'oec'
export const ScanUrlOec = IS_DEV
  ? 'https://www.oklink.com/okexchain-test'
  : 'https://www.oklink.com/okexchain'
export const ChainIdsOec = {
  MAINNET: {id: 66, name: 'Mainnet'},
  TESTNET: {id: 65, name: 'Testnet'},
}

/**
 * conflux config
 */
export const KeyOfCfx = 'cfx'
export const ScanUrlCfx = IS_DEV
  ? 'https://testnet.confluxscan.io'
  : 'https://confluxscan.io'
export const ChainIdsCfx = {
  MAINNET: {id: 1029, name: 'Hydra'},
  TESTNET: {id: 1, name: 'Testnet'},
}

/**
 * bitcoin config
 */
export const KeyOfBtc = 'btc'
export const ScanUrlBtc = IS_DEV
  ? 'https://blockstream.info/testnet'
  : 'https://blockstream.info'

/**
 * heco config
 */

export const KeyOfHeco = 'heco'
export const ScanUrlHeco = IS_DEV
  ? 'https://testnet.hecoinfo.com/'
  : 'https://hecoinfo.com/'
export const ChainIdsHeco = {
  MAINNET: {id: 128, name: 'Mainnet'},
  TESTNET: {id: 256, name: 'Testnet'},
}

export const KeyOfPortal = 'portal'
export const KeyOfMetaMask = 'metamask'
export const WalletConfig = {
  [KeyOfPortal]: {
    key: KeyOfPortal,
    name: 'FluentWallet',
    website: 'https://fluentwallet.com',
    icon(className) {
      return <WalletIcon className={className} type={KeyOfPortal} />
    },
  },
  [KeyOfMetaMask]: {
    key: KeyOfMetaMask,
    name: 'MetaMask',
    website: 'https://metamask.io',
    icon(className) {
      return <WalletIcon className={className} type={KeyOfMetaMask} />
    },
  },
}

export const ChainIdsBtc = {
  MAINNET: {name: 'Mainnet'},
  TESTNET: {name: 'Testnet'},
}

export const displayFilter = obj => {
  return obj?.supported === 1 && obj?.in_token_list === 1
}

/**
 * chain config
 */
export const ChainConfig = {
  [KeyOfEth]: {
    key: KeyOfEth,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfEth} />
    },
    fullName: 'Ethereum', //full name of the chain
    shortName: 'Ethereum', // short name of chain, usually used for fetching api
    tokenName: 'ETH', //the name of native token for this chain
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlEth,
    scanTxUrl: ScanUrlEth + '/tx/',
    scanTokenUrl: ScanUrlEth + '/token/',
    // commonTokens: ['ETH', 'USDT', 'eCFX'],
    commonTokens: IS_DEV
      ? [
          'eth',
          '0x08130635368aa28b217a4dfb68e1bf8dc525621c', //AfroX
          '0x27ccd03d1eccb2cbced1efbb18554bbfd526800a', //ecfx
        ]
      : [
          'eth',
          '0xdac17f958d2ee523a2206206994597c13d831ec7', //usdt
          '0xa1f82e14bc09a1b42710df1a8a999b62f294e592', //ecfx
        ],
    supportedChainIds: ChainIdsEth,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.15, //when you shuttle in some tokens,for example: ETH-cETH,you must have reminder of this amount to pay fee
  },
  [KeyOfBsc]: {
    key: KeyOfBsc,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfBsc} />
    },
    fullName: 'Binance Smart Chain',
    shortName: 'BSC',
    tokenName: 'BNB',
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlBsc,
    scanTxUrl: ScanUrlBsc + '/tx/',
    scanTokenUrl: ScanUrlBsc + '/token/',
    // commonTokens: ['BNB', 'bCFX'],
    commonTokens: IS_DEV
      ? ['bnb', '0xef3f743830078a9cb5ce39c212ec1ca807e45fe1']
      : ['bnb', '0x045c4324039da91c52c55df5d785385aab073dcf'],
    supportedChainIds: ChainIdsBsc,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.002,
  },
  [KeyOfOec]: {
    key: KeyOfOec,
    icon(className, size) {
      return <ChainIcon className={className} size={size} chain={KeyOfOec} />
    },
    fullName: 'OKExChain',
    shortName: 'OEC',
    tokenName: 'OKT',
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlOec,
    scanTxUrl: ScanUrlOec + '/tx/',
    scanTokenUrl: ScanUrlOec + '/tokenAddr/',
    // commonTokens: ['okt', 'cfxk'],
    commonTokens: IS_DEV
      ? ['okt', '0xae6155367003e028b594f1139f2b6edbcb5bb297']
      : ['okt', '0xfcd4d15f09548cd90efcaf0b1d9531bba670b7b1'],
    supportedChainIds: ChainIdsOec,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.001,
  },
  [KeyOfHeco]: {
    key: KeyOfHeco,
    icon(className, size) {
      return <ChainIcon className={className} size={size} chain={KeyOfHeco} />
    },
    fullName: 'Huobi ECO Chain',
    shortName: 'HECO',
    tokenName: 'HT',
    checkAddress: checkHexAddress,
    displayFilter,
    scanUrl: ScanUrlHeco,
    scanTxUrl: ScanUrlHeco + '/tx/',
    scanTokenUrl: ScanUrlHeco + '/address/',
    commonTokens: IS_DEV
      ? ['ht', '0x0D0A4732c5e3A19d912Cdbb12F57A3b185130C6D']
      : ['ht', '0x045c4324039dA91c52C55DF5D785385Aab073DcF'],
    supportedChainIds: ChainIdsHeco,
    wallet: KeyOfMetaMask,
    remainderAmount: 0.001,
  },
  [KeyOfCfx]: {
    key: KeyOfCfx,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfCfx} />
    },
    fullName: 'Conflux',
    shortName: 'Conflux',
    tokenName: 'CFX',
    checkAddress: checkCfxTokenAddress,
    displayFilter,
    scanUrl: ScanUrlCfx,
    scanTxUrl: ScanUrlCfx + '/transaction/',
    scanTokenUrl: ScanUrlCfx + '/address/',
    // commonTokens: ['CFX', 'cUSDT', 'cETH'],
    commonTokens: IS_DEV
      ? [
          'cfx',
          'cfxtest:acbp2sm9d1ajzthsep0nkmpm0su0n4dzmeexzdcksf',
          'cfxtest:acceftennya582450e1g227dthfvp8zz1p370pvb6r',
        ]
      : [
          'cfx',
          'cfx:acf2rcsh8payyxpg6xj7b0ztswwh81ute60tsw35j7',
          'cfx:acdrf821t59y12b4guyzckyuw2xf1gfpj2ba0x4sj6',
        ],
    supportedChainIds: ChainIdsCfx,
    wallet: KeyOfPortal,
    remainderAmount: 1,
  },
  [KeyOfBtc]: {
    key: KeyOfBtc,
    icon(className) {
      return <ChainIcon className={className} chain={KeyOfBtc} />
    },
    fullName: 'Bitcoin',
    shortName: 'Bitcoin',
    tokenName: 'BTC',
    checkAddress: checkBtcAddress,
    displayFilter() {
      return true
    },
    scanUrl: ScanUrlBtc,
    scanTxUrl: ScanUrlBtc + '/tx/',
    commonTokens: [],
    supportedChainIds: ChainIdsBtc,
    remainderAmount: 0,
  },
}

export const SupportedChains = Object.keys(ChainConfig)

export const SupportedWallets = Object.keys(WalletConfig)

// set default chain to FromChain and ToChain when shuttle
export const DefaultFromChain = KeyOfEth
export const DefaultToChain = KeyOfCfx
export const SupportedChainIdsWeb3 = [
  ...Object.values(ChainConfig[KeyOfEth].supportedChainIds).map(
    chain => chain.id,
  ),
  ...Object.values(ChainConfig[KeyOfBsc].supportedChainIds).map(
    chain => chain.id,
  ),
  ...Object.values(ChainConfig[KeyOfOec].supportedChainIds).map(
    chain => chain.id,
  ),
  ...Object.values(ChainConfig[KeyOfHeco].supportedChainIds).map(
    chain => chain.id,
  ),
]

const DefaultChainIconSize = 'w-10 h-10'
export function ChainIcon({chain, className = ''}) {
  let icon
  switch (chain) {
    case KeyOfEth:
      icon = <ChainEthLogo />
      break
    case KeyOfBsc:
      icon = <ChainBscLogo />
      break
    case KeyOfCfx:
      icon = <ChainCfxLogo />
      break
    case KeyOfBtc:
      icon = <ChainBtcLogo />
      break
    case KeyOfOec:
      icon = <ChainOecLogo />
      break
    case KeyOfHeco:
      icon = <ChainHecoLogo />
      break
    default:
      //TODO: maybe need to change a better default icon
      icon = <></>
      break
  }
  return React.cloneElement(icon, {
    className: `${DefaultChainIconSize} ${className}`,
  })
}

const DefaultWalletIconSize = 'w-4 h-4'
export function WalletIcon({type, className = ''}) {
  let icon
  switch (type) {
    case KeyOfPortal:
      icon = <FluentLogo />
      break
    case KeyOfMetaMask:
      icon = <MetamaskLogo />
      break
    default:
      icon = <></>
      break
  }
  return React.cloneElement(icon, {
    className: `${DefaultWalletIconSize} ${className}`,
  })
}

ChainIcon.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  className: PropTypes.string,
}

WalletIcon.propTypes = {
  type: PropTypes.oneOf(SupportedWallets).isRequired,
  className: PropTypes.string,
}
