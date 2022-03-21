import {ChainConfig, KeyOfCfx} from '../constants/chainConfig'
import {Mainnet, Testnet} from '../constants'
import Big from 'big.js'
import {BigNumber} from '@ethersproject/bignumber'
import {BigNumZero} from '../constants'
import {checkCfxTokenAddress} from './address'

export const IS_DEV =
  window.location.hostname === 'localhost' ||
  window.location.hostname.indexOf('test') > -1

export const getEllipsStr = (str, frontNum, endNum) => {
  if (str) {
    const length = str.length
    if (endNum === 0 && length <= frontNum) {
      return str.substring(0, frontNum)
    }
    return (
      str.substring(0, frontNum) +
      '...' +
      str.substring(length - endNum, length)
    )
  }
  return ''
}

export function isNumber(value) {
  return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
}

export const getMaxAmount = (chain, amount) => {
  const remainderAmount = ChainConfig[chain]?.remainderAmount
  let amountBig = new Big(amount)
  if (amountBig.gt(remainderAmount)) {
    return amountBig.minus(remainderAmount)
  } else {
    return BigNumZero
  }
}

// add 10%
export function calculateGasMargin(value, margin = 0.1) {
  return BigNumber.from(value?.toString(10))
    .mul(BigNumber.from(10000).add(BigNumber.from(10000 * margin)))
    .div(BigNumber.from(10000))
}

export function getExponent(decimals) {
  return `1e${decimals}`
}

export function getChainIdRight(chain, chainId, address, addrType = 'user') {
  const {wallet, supportedChainIds} = ChainConfig[chain] || {}
  const isCfxChain = chain === KeyOfCfx ? true : false

  if (isCfxChain) {
    return (
      wallet &&
      chainId == supportedChainIds?.[IS_DEV ? Testnet : Mainnet].id &&
      checkCfxTokenAddress(address, addrType)
    )
  }

  return wallet && chainId == supportedChainIds?.[IS_DEV ? Testnet : Mainnet].id
}

//remove duplicate object from array
export function uniqueArray(arr) {
  return arr.filter((item, index) => {
    const _thing = JSON.stringify(item)
    return (
      index ===
      arr.findIndex(obj => {
        return JSON.stringify(obj) === _thing
      })
    )
  })
}

//whether contains object in array
export function containsObj(arr, obj) {
  arr.forEach(item => {
    const _item = JSON.stringify(item)
    if (JSON.stringify(obj) === _item) {
      return true
    }
    return false
  })
}

/**
 * whether the value of each object in this array equals to the value
 * @param {*} arr
 * @param {*} key
 * @param {*} value
 */
export function containsValueBy(arr, key, value) {
  arr.forEach(item => {
    if (item[key] === value) {
      return true
    }
    return false
  })
}

export function removeTxByHash(trans, hash) {
  const index = trans.findIndex(tran => tran.hash == hash)
  trans.splice(index, 1)
  return trans
}

export function removeTxs(trans, hashs) {
  hashs.forEach(hash => {
    trans.delete(hash)
  })
  return trans
}

export function appendTxs(trans, txs) {
  txs.forEach(tx => {
    const hash = tx?.hash
    trans.set(hash, tx)
  })
}

export function updateTx(trans, hash, data) {
  trans.set(hash, {...trans.get(hash), ...data})
}
