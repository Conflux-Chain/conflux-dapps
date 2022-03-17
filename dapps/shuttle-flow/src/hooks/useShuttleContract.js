import {ContractConfig} from '../constants/contractConfig'
import {useContract as useContractPortal} from '../hooks/usePortal'
import {useContract as useContractWeb3} from '../hooks/useWeb3Network'
import {KeyOfMetaMask, KeyOfPortal} from '../constants/chainConfig'

export function useShuttleContract(contractType, chain) {
  const contractObj = ContractConfig[contractType]
  const {abi, wallet} = contractObj
  const addressOfChain = contractObj?.address
  const address =
    typeof addressOfChain === 'object'
      ? addressOfChain[chain] || ''
      : addressOfChain
  const contractPortal = useContractPortal(address, abi)
  const contractWeb3 = useContractWeb3(address, abi)
  let contract = {}
  switch (wallet) {
    case KeyOfMetaMask:
      contract = contractWeb3
      break
    case KeyOfPortal:
      contract = contractPortal
      break
  }
  return contract
}

/**
 *
 * @param {*} contractType
 * @param {*} chain
 * @param {*} methodWithParams first param is method name,second param is the params of this method
 */
export function useContractData(contractType, chain, methodWithParams = []) {
  const contract = useShuttleContract(contractType, chain)
  let methodArr = []
  methodWithParams.map(item => {
    methodArr.push(contract[item[0]](item[1]))
  })
  const promiseArr = methodArr.map(fn => fn.call())
  let reseponse = []
  Promise.all(promiseArr)
    .then(data => {
      reseponse = data
    })
    .catch(() => {
      reseponse = []
    })
  return reseponse
}
