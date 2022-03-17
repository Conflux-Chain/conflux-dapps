/* eslint-disable react-hooks/exhaustive-deps */
/**
 * data about shuttle, mainly various contract params
 */
import {useState, useEffect} from 'react'
import Big from 'big.js'
import {useShuttleContract} from './useShuttleContract'
import {ContractType} from '../constants/contractConfig'
import {KeyOfBtc, KeyOfCfx} from '../constants/chainConfig'
import {ZeroAddrHex} from '../constants'
import {useIsCfxChain} from '../hooks'
import {useTokenAddress} from '../hooks/useTokenList'
import {getExponent} from '../utils'

export function useShuttleData() {}

/**
 *
 * @param {*} chainOfContract which chain this contract in
 * @param {*} token
 * @returns
 */
export function useCustodianData(chainOfContract, token) {
  const {origin, decimals, ctoken} = token
  const isCfxChain = useIsCfxChain(origin)
  let contractAddress = useTokenAddress(token, isCfxChain)
  if (ctoken === KeyOfCfx) {
    contractAddress = ZeroAddrHex
  }

  const obverseContract = useShuttleContract(
    ContractType.custodianImpl,
    chainOfContract,
  )
  const reverseContract = useShuttleContract(
    ContractType.custodianImplReverse,
    chainOfContract,
  )
  const contract = isCfxChain ? reverseContract : obverseContract
  const dicimalsNum = getExponent(decimals)
  const [contractData, setContractData] = useState({})
  useEffect(() => {
    if (!origin || !contract) {
      setContractData({})
      return
    }
    Promise.all(
      [
        contract['burn_fee'](contractAddress),
        contract['mint_fee'](contractAddress),
        contract['wallet_fee'](contractAddress),
        contractAddress === KeyOfBtc
          ? contract['btc_minimal_burn_value']()
          : contract['minimal_mint_value'](contractAddress),
        contractAddress === KeyOfBtc
          ? contract['btc_minimal_burn_value']()
          : contract['minimal_burn_value'](contractAddress),
        contract['minimal_sponsor_amount'](),
        contract['safe_sponsor_amount'](),
      ].map(fn => fn.call()),
    )
      .then(data => {
        const [
          // eslint-disable-next-line no-unused-vars
          burn_fee,
          // eslint-disable-next-line no-unused-vars
          mint_fee,
          wallet_fee,
          minimal_mint_value,
          minimal_burn_value,
          minimal_sponsor_amount,
          safe_sponsor_amount,
        ] = data.map(x => Big(x))

        setContractData({
          //   in_fee: isCfxChain
          //     ? burn_fee.div(`${dicimalsNum}`)
          //     : mint_fee.div(`${dicimalsNum}`),
          in_fee: Big(0), //shuttle in fee has already benn zero in new version
          out_fee: Big(0), //shuttle out fee has already benn zero in claim version
          wallet_fee: wallet_fee.div(`${dicimalsNum}`),
          minimal_in_value:
            contractAddress === KeyOfBtc
              ? minimal_mint_value.div(`${dicimalsNum}`)
              : Big(0), //only btc token pair have the minimal_in_value
          minimal_out_value:
            contractAddress === KeyOfBtc
              ? minimal_burn_value.div(`${dicimalsNum}`)
              : Big(0), //only btc token pair have the minimal_out_value
          minimal_sponsor_amount: minimal_sponsor_amount.div(getExponent(18)),
          safe_sponsor_amount: safe_sponsor_amount.div(getExponent(18)),
        })
      })
      .catch(() => {
        setContractData({})
      })
  }, [
    isCfxChain,
    chainOfContract,
    contractAddress,
    dicimalsNum,
    origin,
    Boolean(contract),
  ])
  return contractData
}

export function useSponsorData(chainOfContract, token) {
  const {origin, ctoken} = token
  const isCfxChain = useIsCfxChain(origin)
  let contractAddress = useTokenAddress(token, isCfxChain)
  if (ctoken === KeyOfCfx) {
    contractAddress = ZeroAddrHex
  }
  const obverseData = useShuttleContract(
    ContractType.tokenSponsor,
    chainOfContract,
  )
  const reverseData = useShuttleContract(
    ContractType.tokenSponsorReverse,
    chainOfContract,
  )
  const contract = isCfxChain ? reverseData : obverseData
  const [contractData, setContractData] = useState({})
  useEffect(() => {
    if (!origin || !contract) {
      setContractData({})
      return
    }
    Promise.all(
      [
        contract['sponsorOf'](contractAddress),
        contract['sponsorValueOf'](contractAddress),
      ].map(fn => fn.call()),
    )
      .then(data => {
        setContractData({
          sponsor: data[0],
          sponsorValue: Big(data[1])?.div(getExponent(18)),
        })
      })
      .catch(() => {
        setContractData({})
      })
  }, [chainOfContract, isCfxChain, contractAddress, origin, Boolean(contract)])
  return contractData
}

export function useShuttleFee(chainOfContract, token, toChain) {
  const isToChainCfx = useIsCfxChain(toChain)
  const {in_fee, out_fee} = useCustodianData(chainOfContract, token)
  return isToChainCfx
    ? in_fee
      ? in_fee.toString(10)
      : '0'
    : out_fee
    ? out_fee.toString(10)
    : '0'
}
