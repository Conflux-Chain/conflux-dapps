import create from 'zustand'
import {persist} from 'zustand/middleware'
import fromEntries from 'object.fromentries'
import {TypeTransaction, ShuttleStatus} from '../constants'
import {KeyOfCfx} from '../constants/chainConfig'

let Store = null

const mergeData = data => {
  const isToChainCfx = data?.toChain === KeyOfCfx ? true : false
  const infoData = {
    timestamp: Date.now(),
    tx_type: TypeTransaction.transaction,
    status: ShuttleStatus.pending,
    in_or_out: isToChainCfx ? 'in' : 'out',
  }
  const mergedData = {...infoData, ...data}
  return mergedData
}

export const createStore = () =>
  create(
    persist(
      (set, get) => ({
        transactions: {},
        setTransactions: transactions => {
          set({transactions: fromEntries(transactions)})
        },
        unshiftTx: tx => {
          let trans = get().transactions
          trans[tx.hash] = mergeData(tx)
          set({transactions: trans})
        },
        claimedTxs: {},
        setClaimedTxs: claimedTxs => {
          set({claimedTxs: fromEntries(claimedTxs)})
        },
        setTx: (hash, value) => {
          let trans = get().claimedTxs
          trans[hash] = value
          set({claimedTxs: trans})
        },
      }),
      {
        name: 'transactions', // unique name
        getStorage: () => localStorage,
      },
    ),
  )

export const useTxState = () => {
  if (!Store) Store = createStore()
  const useStore = Store
  const state = useStore()
  return state
}
