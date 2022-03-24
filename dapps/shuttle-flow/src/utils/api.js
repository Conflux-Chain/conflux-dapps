import jsonRpc from './request'
import {ZeroAddrHex} from '../constants'

export const RPC_Method = {
  getTokenList: 'getTokenList',
  searchToken: 'searchToken',
  getUserWallet: 'getUserWallet',
  getUserOperationByHash: 'getUserOperationByHash',
  getUserOperationList: 'getUserOperationList',
}

export function requestAllTokenList(url) {
  return jsonRpc(url, RPC_Method.getTokenList, [])
}

export function requestToken(url, fromChain, toChain, address) {
  return jsonRpc(url, RPC_Method.searchToken, [fromChain, toChain, address])
}

/**
 *
 * @param {*} url api url
 * @param {*} address (String) user conflux address (shuttle-in) or external chain address (shuttle-out)
 * @param {*} defi (String) conflux defi address (for shuttleflow frontend, hard code zero address)
 * @param {*} fromChain (String) source chain ("btc" | "cfx")
 * @param {*} toChain  (String) target chain ("cfx" | "eth" | "bsc")
 * @param {*} type (String) "in" | "out"
 */
export function requestUserWallet(
  url,
  address,
  defi = ZeroAddrHex,
  fromChain,
  toChain,
  type,
) {
  return jsonRpc(url, RPC_Method.getUserWallet, [
    address,
    defi,
    fromChain,
    toChain,
    type,
  ])
}

/**
 *
 * @param {*} url
 * @param {*} hash  transaction hash
 * @param {*} type "in"(another chain to conflux) | "out" (conflux to another chain)
 * @param {*} fromChain
 * @param {*} toChain
 * @returns
 */
export function requestUserOperationByHash(
  url,
  hash,
  type,
  fromChain,
  toChain,
) {
  return jsonRpc(url, RPC_Method.getUserOperationByHash, [
    hash,
    type,
    fromChain,
    toChain,
  ])
}

/**
 *
 * @param {*} url
 * @param {*} type "in" | "out"
 * @param {*} address user conflux address
 * @param {*} status ["doing", "finished"]
 * @param {*} fromChain
 * @param {*} toChain
 * @param {*} limit the maximum number of operations to return, <= 100
 * @param {*} defi conflux defi address (for shuttleflow frontend, hard code zero address)
 * @returns
 */
export function requestUserOperationList(
  url,
  type,
  address,
  status,
  fromChain,
  toChain,
  limit = 100,
  defi = ZeroAddrHex,
) {
  return jsonRpc(url, RPC_Method.getUserOperationList, [
    {
      type,
      defi,
      address,
      status,
      from_chain: fromChain,
      to_chain: toChain,
    },
    0,
    limit,
  ])
}
