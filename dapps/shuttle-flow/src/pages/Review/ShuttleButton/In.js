/* eslint-disable no-debugger */
/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { convertDecimal } from "@cfxjs/data-format";
import { format } from "js-conflux-sdk/dist/js-conflux-sdk.umd.min.js";
import { BigNumber } from "@ethersproject/bignumber";

import { Button } from "../../../components";
import { SupportedChains } from "../../../constants/chainConfig";
import { ContractType } from "../../../constants/contractConfig";
import Big from "big.js";

import { ZeroAddrHex, TypeTransaction, SendStatus } from "../../../constants";
import { useIsNativeToken } from "../../../hooks/useWallet";
import { useTokenContract } from "../../../hooks/useWeb3Network";
import { calculateGasMargin } from "../../../utils";
import { useShuttleContract } from "../../../hooks/useShuttleContract";
import { useIsCfxChain } from "../../../hooks";
import useShuttleAddress from "../../../hooks/useShuttleAddress";
import { useTxState } from "../../../state/transaction";

function ShuttleInButton({
  fromChain,
  toChain,
  fromToken,
  toToken,
  value,
  onClose,
  disabled,
  fromAddress,
  toAddress,
  setSendStatus,
  nextClick,
}) {
  const { t } = useTranslation();
  const { address: fromTokenAddress, decimals, origin } = fromToken;
  const isCfxChain = useIsCfxChain(origin);
  const isNativeToken = useIsNativeToken(fromChain, fromTokenAddress);
  const drContract = useShuttleContract(ContractType.depositRelayer, fromChain);
  const tokenContract = useTokenContract(fromTokenAddress);
  const shuttleAddress = useShuttleAddress(toAddress, toChain, fromChain, "in");
  const { unshiftTx, transactions } = useTxState();
  window._transactions = new Map(Object.entries(transactions));

  function getShuttleStatusData(hash, type = TypeTransaction.transaction) {
    const data = {
      hash: hash,
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount: value,
      fromToken,
      toToken,
      tx_type: type,
      cfxAddress: toAddress,
    };
    return data;
  }

  // function fetchShuttleData(hash) {
  //   const interval = setInterval(async () => {
  //     const operationData = await requestUserOperationByHash(
  //       ProxyUrlPrefix.shuttleflow,
  //       hash,
  //       'in',
  //       origin,
  //       isCfxChain ? fromChain : KeyOfCfx,
  //     )
  //     if (operationData?.tx_to && operationData?.tx_input) {
  //       setSendStatus(SendStatus.claim)
  //       updateTx(window._transactions, hash, {
  //         tx_to: operationData?.tx_to,
  //         tx_input: operationData?.tx_input,
  //         toAddress: operationData?.to_addr,
  //       })
  //       setTransactions(window._transactions)
  //       interval && clearInterval(interval)
  //     }
  //   }, 1000)
  // }

  const onSubmit = async () => {
    onClose && onClose();
    nextClick && nextClick();
    setSendStatus(SendStatus.ongoing);
    if (isNativeToken) {
      let params = [
        format.hexAddress(toAddress),
        ZeroAddrHex,
        {
          value: new Big(
            convertDecimal(value, "multiply", decimals)
          ).toString(),
        },
      ];
      try {
        let gas = await drContract.estimateGas.deposit(
          params[0],
          params[1],
          params[2]
        );
        drContract
          .deposit(params[0], params[1], {
            ...params[2],
            gasLimit: calculateGasMargin(gas),
          })
          .then((data) => {
            unshiftTx(getShuttleStatusData(data?.hash));
            // fetchShuttleData(data?.hash)
            setSendStatus(SendStatus.success);
          })
          .catch((error) => {
            console.warn(error);
            setSendStatus(SendStatus.error);
          });
      } catch (error) {
        console.warn(error);
        setSendStatus(SendStatus.error);
      }
    } else {
      if (!isCfxChain) {
        let params = [
          fromTokenAddress,
          format.hexAddress(toAddress),
          ZeroAddrHex,
          new Big(convertDecimal(value, "multiply", decimals)).toString(),
          {
            value: BigNumber.from(0),
          },
        ];
        try {
          let gasDt = await drContract.estimateGas.depositToken(
            params[0],
            params[1],
            params[2],
            params[3],
            params[4]
          );
          drContract
            .depositToken(params[0], params[1], params[2], params[3], {
              ...params[4],
              gasLimit: calculateGasMargin(gasDt),
            })
            .then((data) => {
              unshiftTx(getShuttleStatusData(data?.hash));
              // fetchShuttleData(data?.hash)
              setSendStatus(SendStatus.success);
            })
            .catch((error) => {
              console.warn(error);
              setSendStatus(SendStatus.error);
            });
        } catch (error) {
          console.warn(error);
          setSendStatus(SendStatus.error);
        }
      } else {
        const amountVal = new Big(
          convertDecimal(value, "multiply", decimals)
        ).toString();
        try {
          const gasData = await tokenContract.estimateGas.transfer(
            shuttleAddress,
            amountVal
          );
          tokenContract
            .transfer(shuttleAddress, amountVal, {
              gasLimit: calculateGasMargin(gasData),
            })
            .then((data) => {
              unshiftTx(getShuttleStatusData(data?.hash));
              // fetchShuttleData(data?.hash)
              setSendStatus(SendStatus.success);
            })
            .catch((error) => {
              console.warn(error);
              setSendStatus(SendStatus.error);
            });
        } catch (error) {
          console.warn(error);
          setSendStatus(SendStatus.error);
        }
      }
    }
  };

  return (
    <Button
      onClick={onSubmit}
      disabled={disabled}
      className="w-[319px] ml-8"
      size="large"
      id="sendBtn"
    >
      {t("sendToWallet")}
    </Button>
  );
}

ShuttleInButton.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object,
  value: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  setTxModalType: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  setSendStatus: PropTypes.func,
  nextClick: PropTypes.func,
};

export default ShuttleInButton;
