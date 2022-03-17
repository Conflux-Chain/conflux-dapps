/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react'
import {convertDecimal} from '@cfxjs/data-format'
import {useWallet} from '../hooks/useWallet'
import {
  StatusOperation,
  ShuttleStatus,
  TypeTransaction,
  ProxyUrlPrefix,
} from '../constants'
import {KeyOfCfx, KeyOfBtc} from '../constants/chainConfig'
import {requestUserOperationList} from '../utils/api'
import {useTxState} from '../state/transaction'
import {useShuttleState} from '../state'
import {useActiveWeb3React} from './useWeb3Network'
import {useAllTokenList, mapToken} from '../hooks/useTokenList'
import {appendTxs, updateTx} from '../utils/index'
import {
  useTransactionNotification,
  useClaimNotification,
} from '../pages/components'
import {format} from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js'

export const useUpdateTxs = () => {
  const {address: cfxAddress} = useWallet(KeyOfCfx)
  const {library} = useActiveWeb3React()
  const {transactions, setTransactions} = useTxState()
  const {txClaimModalShown} = useShuttleState()
  const tokenList = useAllTokenList()
  const txNotificationShow = useTransactionNotification()
  const claimNotificationShow = useClaimNotification()
  window._transactions = new Map(Object.entries(transactions))
  useEffect(() => {
    const update = () => {
      let trans = new Map(window._transactions)
      let transArr = [...trans.values()]
      //when tx type is approve transaction
      const approveTxs = transArr.filter(
        item => item.tx_type === TypeTransaction.approve,
      )
      const pendingApproveTxs = approveTxs.filter(
        item => item.status === ShuttleStatus.pending,
      )
      const pendingInApproveTxs = pendingApproveTxs.filter(
        item => item.fromChain !== KeyOfCfx,
      )
      if (library) {
        pendingInApproveTxs.forEach(item => {
          const {hash} = item
          library.getTransactionReceipt(hash).then(res => {
            if (res?.status) {
              updateTx(trans, hash, {status: ShuttleStatus.success})
            } else {
              updateTx(trans, hash, {status: ShuttleStatus.error})
            }
          })
        })
      }

      const pendingOutApproveTxs = pendingApproveTxs.filter(
        item => item.fromChain === KeyOfCfx,
      )

      if (window?.confluxJS) {
        pendingOutApproveTxs.forEach(item => {
          const {hash} = item
          window.confluxJS.getTransactionReceipt(hash).then(res => {
            if (res?.outcomeStatus == 0) {
              updateTx(trans, hash, {status: ShuttleStatus.success})
            } else {
              updateTx(trans, hash, {status: ShuttleStatus.error})
            }
          })
        })
      }

      // when tx type is common transacton
      const commonTxs = transArr.filter(
        item => item.tx_type === TypeTransaction.transaction,
      )
      const pendingCommonTxs = commonTxs.filter(
        item =>
          item.status === ShuttleStatus.pending ||
          item.status === ShuttleStatus.waiting,
      )
      requestUserOperationList(
        ProxyUrlPrefix.shuttleflow,
        null,
        cfxAddress,
        Object.values(StatusOperation),
        null,
        null,
        10000,
      )
        .then(list => {
          if (list) {
            const newList = list.map(item => mapData(item, tokenList))
            const mappedData = _mapListToMap(newList)
            pendingCommonTxs.forEach((item, index) => {
              const {hash, amount, fromChain, toChain, fromToken, status} = item
              const {display_symbol} = fromToken
              const apiData = mappedData.get(hash)
              const {status: newStatus} = apiData || {}
              if (newStatus === ShuttleStatus.success) {
                //Success Notification
                txNotificationShow({
                  symbol: display_symbol,
                  fromChain,
                  toChain,
                  value: amount,
                })
              }
              if (
                toChain !== KeyOfBtc &&
                status === ShuttleStatus.pending &&
                newStatus === ShuttleStatus.waiting &&
                !txClaimModalShown
              ) {
                //Claim Notification
                claimNotificationShow({
                  key: index,
                  symbol: display_symbol,
                  fromChain,
                  toChain,
                  value: amount,
                  hash,
                })
              }
            })
            appendTxs(trans, newList)
            setTransactions(trans)
          }
        })
        .finally(() => {})
    }
    if (cfxAddress) {
      update()
    }
    let timeInterval
    if (cfxAddress) {
      timeInterval = setInterval(() => update(), 30000)
    }
    return () => {
      timeInterval && clearInterval(timeInterval)
    }
  }, [cfxAddress, txClaimModalShown])

  function _mapListToMap(list) {
    const map = new Map()
    list.forEach(item => {
      const {hash} = item
      map.set(hash, item)
    })
    return map
  }
}

/**
 * Get tokenInfo from tokenList by token address
 * Merge api data to local data
 */
export function mapData(item = {}, tokenList) {
  const data = {}
  if (!item) return {}
  const {
    from_chain,
    to_chain,
    token,
    status,
    timestamp,
    in_or_out,
    nonce_or_txid,
    to_addr,
    amount,
    tx_to,
    tx_input,
    user_addr,
  } = item
  const isCfxChain = from_chain === KeyOfCfx ? true : false
  const newList = tokenList
    .filter(item => token === (isCfxChain ? item.ctoken : item.reference))
    .filter(item => item.to_chain === to_chain)
  const tokenInfo = (newList && newList[0]) || {}
  data.response = item
  data.decimals = tokenInfo?.decimals
  data.status = ShuttleStatus.pending
  if (status === 'confirming') {
    data.status = ShuttleStatus.pending
  }
  if (status === 'doing') {
    if (tx_to && tx_input) {
      data.status = ShuttleStatus.waiting
    } else {
      data.status = ShuttleStatus.pending
    }
  }
  if (status === 'finished') {
    data.status = 'success'
  }
  if (status === 'invalid') {
    data.status = 'error'
  }
  data.timestamp = timestamp
  data.in_or_out = in_or_out
  if (in_or_out === 'in') {
    if (from_chain === KeyOfCfx) {
      data.fromChain = to_chain
      data.toChain = from_chain
    } else {
      data.fromChain = from_chain
      data.toChain = to_chain
    }
  }
  if (in_or_out === 'out') {
    if (from_chain === KeyOfCfx) {
      data.fromChain = from_chain
      data.toChain = to_chain
    } else {
      data.fromChain = to_chain
      data.toChain = from_chain
    }
  }
  data.fromToken = JSON.parse(
    JSON.stringify(mapToken(tokenInfo, data.fromChain === KeyOfCfx)),
  )
  data.toToken = JSON.parse(
    JSON.stringify(mapToken(tokenInfo, data.toChain === KeyOfCfx)),
  )
  data.toAddress = to_addr
  data.tx_type = TypeTransaction.transaction
  data.hash = nonce_or_txid?.split('_')[0]
  data.amount = convertDecimal(amount || 0, 'divide', data.decimals)
  data.tx_to = tx_to
  data.tx_input = tx_input
  data.cfxAddress = user_addr
  return data
}

export const useTxData = (
  multipleOrderedStatus,
  transactionTypes = Object.values(TypeTransaction),
) => {
  const {transactions} = useTxState()
  const [arr, setArr] = useState([])
  const {address} = useWallet(KeyOfCfx)
  useEffect(() => {
    if (address) {
      const transArr = Object.values(transactions)
      const filteredTypeTxs = transArr.filter(
        tx => transactionTypes.indexOf(tx?.tx_type) != -1,
      )
      const filteredTxs = filteredTypeTxs.filter(
        tx =>
          tx?.cfxAddress &&
          address &&
          format.hexAddress(tx?.cfxAddress) === format.hexAddress(address),
      )
      let newArr = []
      multipleOrderedStatus.forEach(status => {
        let groupedArr = []
        groupedArr = filteredTxs.filter(tx => tx?.status === status)
        groupedArr.sort(function (a, b) {
          return b.timestamp - a.timestamp
        })
        if (status === ShuttleStatus.success && groupedArr.length > 100) {
          groupedArr = groupedArr.slice(0, 100) //first 100 element
        }
        newArr = newArr.concat(groupedArr)
      })
      setArr(newArr)
    } else {
      setArr([])
    }
  }, [JSON.stringify(transactions), address])
  return arr
}
