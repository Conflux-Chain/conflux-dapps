/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect} from 'react'
import {useTxState} from '../state/transaction'
import {TxStatus} from '../constants'
import {KeyOfMetaMask, KeyOfPortal} from '../constants/chainConfig'
import {useActiveWeb3React} from './useWeb3Network'
import {updateTx} from '../utils/index'

export const useUpdateClaimedTxs = () => {
  const {claimedTxs, setClaimedTxs} = useTxState()
  const {library} = useActiveWeb3React()
  window._claimedTxs = new Map(Object.entries(claimedTxs))
  useEffect(() => {
    const update = async () => {
      let trans = new Map(window._claimedTxs)
      let transArr = [...trans.values()]
      const submittedTrans = transArr.filter(
        item => item.status === TxStatus.submitted,
      )
      const mmSubmittedTrans = submittedTrans.filter(
        item => item.wallet === KeyOfMetaMask,
      )
      const portalSubmittedTrans = submittedTrans.filter(
        item => item.wallet === KeyOfPortal,
      )
      const mmArr = []
      if (library) {
        mmSubmittedTrans.forEach(item => {
          const {claimHash} = item
          mmArr.push(library.getTransactionReceipt(claimHash))
        })
      }
      const mmResults = await Promise.all(mmArr)
      mmResults.forEach((res, index) => {
        const {sendHash} = mmSubmittedTrans[index]
        if (res) {
          if (res?.status) {
            updateTx(trans, sendHash, {status: TxStatus.success})
          } else {
            updateTx(trans, sendHash, {status: TxStatus.error})
          }
        }
      })
      const confluxArr = []
      if (window?.confluxJS) {
        portalSubmittedTrans.forEach(item => {
          const {claimHash} = item
          confluxArr.push(window.confluxJS.getTransactionReceipt(claimHash))
        })
      }
      const confluxResults = await Promise.all(confluxArr)
      confluxResults.forEach((res, index) => {
        const {sendHash} = portalSubmittedTrans[index]
        if (res) {
          if (res?.outcomeStatus == 0) {
            updateTx(trans, sendHash, {status: TxStatus.success})
          } else {
            updateTx(trans, sendHash, {status: TxStatus.error})
          }
        }
      })
      setClaimedTxs(trans)
    }
    update()
    const timeInterval = setInterval(() => update(), 5000)
    return () => {
      timeInterval && clearInterval(timeInterval)
    }
  }, [library])
}
