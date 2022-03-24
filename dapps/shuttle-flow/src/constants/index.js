import Big from 'big.js'

Big.DP = 40
Big.NE = -40
Big.PE = 40

export const NetworkContextName = 'NETWORK'

export const Mainnet = 'MAINNET'
export const Testnet = 'TESTNET'

export const TypeConnectWallet = {
  uninstalled: 'uninstalled',
  loading: 'loading',
  error: 'error',
  success: 'success',
}

export const ProxyUrlPrefix = {
  shuttleflow: '/rpcshuttleflow',
  sponsor: '/rpcsponsor',
}

/**
 * interval time config
 */
export const IntervalTime = {
  fetchBalance: 3000,
  fetchTokenList: 6000,
}

export const BigNumZero = new Big(0)

export const ZeroAddrHex = '0x0000000000000000000000000000000000000000'

export const TxReceiptModalType = {
  ongoing: 'ongoing',
  success: 'success',
  error: 'error',
}

export const SendStatus = {
  ongoing: 'ongoing',
  success: 'success',
  error: 'error',
  claim: 'claim',
}

export const ClaimStatus = {
  ongoing: 'ongoing',
  success: 'success',
  error: 'error',
}

export const MobileBreakpoint = 768

export const Decimal18 = '18'

export const TypeAccountStatus = {
  unconnected: 'unconnected',
  success: 'success',
  error: 'error',
}

/**
 * Type of cached tx type
 */
export const TypeTransaction = {
  transaction: 'transaction', //common transaction,for example: send for native token or transfer for erc20 token
  approve: 'approve', //approve for erc20 token
}

/**
 * Status of shuttle transaction, mainly for local environment
 */
export const ShuttleStatus = {
  pending: 'pending',
  waiting: 'waiting',
  success: 'success',
  error: 'error',
  skip: 'skip',
}

export const StatusOperation = {
  doing: 'doing',
  finished: 'finished',
}

export const Millisecond = {
  day: 24 * 60 * 60 * 1000,
}

export const ClaimButtonType = {
  twoStep: 'twoStep',
  common: 'common',
}

export const TxStatus = {
  submitted: 'submitted',
  success: 'success',
  error: 'error',
}
