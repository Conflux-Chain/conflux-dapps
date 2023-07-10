/* eslint-disable react-hooks/exhaustive-deps */
/**
 * data about shuttle, mainly various contract params
 */
import { useState, useEffect, useMemo } from "react";
import Big from "big.js";
import { useShuttleContract } from "./useShuttleContract";
import { ContractType } from "../constants/contractConfig";
import { KeyOfBtc, KeyOfCfx } from "../constants/chainConfig";
import { ZeroAddrHex } from "../constants";
import { useIsCfxChain } from "../hooks";
import { useTokenAddress } from "../hooks/useTokenList";
import { getExponent } from "../utils";

export function useShuttleData() {}

/**
 *
 * @param {*} chainOfContract which chain this contract in
 * @param {*} token
 * @returns
 */
export function useCustodianData(chainOfContract, token) {
  const {
    origin,
    decimals,
    ctoken,
    minimal_burn_value: token_minimal_burn_value,
    minimal_mint_value: token_minimal_mint_value,
    max_mint_fee,
    max_burn_fee,
  } = token;
  const isCfxChain = useIsCfxChain(origin);
  let contractAddress = useTokenAddress(token, isCfxChain);
  if (ctoken === KeyOfCfx) {
    contractAddress = ZeroAddrHex;
  }

  const obverseContract = useShuttleContract(
    ContractType.custodianImpl,
    chainOfContract
  );
  const reverseContract = useShuttleContract(
    ContractType.custodianImplReverse,
    chainOfContract
  );
  const contract = isCfxChain ? reverseContract : obverseContract;
  const decimalsNum = getExponent(decimals);
  const [contractData, setContractData] = useState({});

  useEffect(() => {
    if (!origin || !contract) {
      setContractData({});
      return;
    }
    Promise.all(
      [
        contract["burn_fee"](contractAddress),
        contract["mint_fee"](contractAddress),
        contract["wallet_fee"](contractAddress),
        contractAddress === KeyOfBtc
          ? contract["btc_minimal_burn_value"]()
          : contract["minimal_mint_value"](contractAddress),
        contractAddress === KeyOfBtc
          ? contract["btc_minimal_burn_value"]()
          : contract["minimal_burn_value"](contractAddress),
        contract["minimal_sponsor_amount"](),
        contract["safe_sponsor_amount"](),
      ].map((fn) => fn.call())
    )
      .then((data) => {
        let [
          burn_fee,
          mint_fee,
          wallet_fee,
          minimal_mint_value,
          minimal_burn_value,
          minimal_sponsor_amount,
          safe_sponsor_amount,
        ] = data.map((x) => Big(x));
        minimal_mint_value =
          contractAddress === KeyOfBtc
            ? minimal_mint_value
            : Big(token_minimal_mint_value);
        minimal_burn_value =
          contractAddress === KeyOfBtc
            ? minimal_burn_value
            : Big(token_minimal_burn_value);
        setContractData({
          //Big(burn_fee).div(decimalsNum)
          burn_fee,
          mint_fee,
          wallet_fee: wallet_fee.div(`${decimalsNum}`),
          minimal_in_value: minimal_mint_value.div(`${decimalsNum}`),
          minimal_out_value: minimal_burn_value.div(`${decimalsNum}`),
          minimal_sponsor_amount: minimal_sponsor_amount.div(getExponent(18)),
          safe_sponsor_amount: safe_sponsor_amount.div(getExponent(18)),
          max_mint_fee: Big(max_mint_fee),
          max_burn_fee: Big(max_burn_fee),
        });
      })
      .catch(() => {
        setContractData({});
      });
  }, [
    isCfxChain,
    chainOfContract,
    contractAddress,
    decimalsNum,
    origin,
    Boolean(contract),
  ]);
  return contractData;
}

export function useSponsorData(chainOfContract, token) {
  const { origin, ctoken } = token;
  const isCfxChain = useIsCfxChain(origin);
  let contractAddress = useTokenAddress(token, isCfxChain);
  if (ctoken === KeyOfCfx) {
    contractAddress = ZeroAddrHex;
  }
  const obverseData = useShuttleContract(
    ContractType.tokenSponsor,
    chainOfContract
  );
  const reverseData = useShuttleContract(
    ContractType.tokenSponsorReverse,
    chainOfContract
  );
  const contract = isCfxChain ? reverseData : obverseData;
  const [contractData, setContractData] = useState({});
  useEffect(() => {
    if (!origin || !contract) {
      setContractData({});
      return;
    }
    Promise.all(
      [
        contract["sponsorOf"](contractAddress),
        contract["sponsorValueOf"](contractAddress),
      ].map((fn) => fn.call())
    )
      .then((data) => {
        setContractData({
          sponsor: data[0],
          sponsorValue: Big(data[1])?.div(getExponent(18)),
        });
      })
      .catch(() => {
        setContractData({});
      });
  }, [chainOfContract, isCfxChain, contractAddress, origin, Boolean(contract)]);
  return contractData;
}

export function useShuttleFee(chainOfContract, token, toChain, value) {
  const isToChainCfx = useIsCfxChain(toChain);
  const { decimals } = token;
  const { burn_fee, mint_fee, max_mint_fee, max_burn_fee } = useCustodianData(
    chainOfContract,
    token
  );
  const decimalsNum = decimals && getExponent(decimals);
  //real_mint_fee = max(min(amount * burn_fee / 1e18, max_mint_fee), mint_fee)
  const in_fee =
    value && burn_fee && max_mint_fee && mint_fee
      ? Math.max(
          Math.min(
            Big(value).times(burn_fee).div(1e18).toNumber(),
            max_mint_fee.div(`${decimalsNum}`).toNumber()
          ),
          mint_fee.div(`${decimalsNum}`).toNumber()
        )
      : Big(0);
  //real_burn_fee = max(min(amount * mint_fee / 1e18, max_burn_fee), burn_fee)
  const out_fee =
    value && mint_fee && max_burn_fee && burn_fee
      ? Math.max(
          Math.min(
            Big(value).times(mint_fee).div(1e18).toNumber(),
            max_burn_fee.div(`${decimalsNum}`).toNumber()
          ),
          burn_fee.div(`${decimalsNum}`).toNumber()
        )
      : Big(0);
  return useMemo(
    () =>
      isToChainCfx
        ? in_fee
          ? in_fee.toString(10)
          : "0"
        : out_fee
        ? out_fee.toString(10)
        : "0",
    [in_fee, out_fee]
  );
}
