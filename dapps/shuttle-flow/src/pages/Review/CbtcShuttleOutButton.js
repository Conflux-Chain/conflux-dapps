import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Big from "big.js";

import { Button } from "../../components";
import { Send } from "../../assets/svg";
import { SupportedChains } from "../../constants/chainConfig";
import useShuttleAddress from "../../hooks/useShuttleAddress";
import { useShuttleContract } from "../../hooks/useShuttleContract";
import { ContractType } from "../../constants/contractConfig";
import { useCustodianData } from "../../hooks/useShuttleData";
import { ZeroAddrHex, TypeTransaction, SendStatus } from "../../constants";
import { useShuttleState } from "../../state";
import { getExponent, calculateGasMargin } from "../../utils";
import { useTxState } from "../../state/transaction";

function CbtcShuttleOutButton({
  fromChain, // is cfx
  toChain, // is btc
  fromToken,
  toToken,
  value,
  disabled,
  fromAddress,
  toAddress,
  setSendStatus,
  nextClick,
}) {
  const { t } = useTranslation();
  const { ctoken } = toToken;
  const [outAddress, setOutAddress] = useState("");
  const shuttleAddress = useShuttleAddress(
    outAddress,
    fromChain,
    toChain,
    "out"
  );
  const tokenBaseContract = useShuttleContract(ContractType.tokenBase);
  const { out_fee } = useCustodianData(toChain, toToken);
  const { toBtcAddress } = useShuttleState();
  const [didMount, setDidMount] = useState(false);
  const { unshiftTx } = useTxState();

  useEffect(() => {
    setDidMount(true);
    setOutAddress(toBtcAddress);
    return () => {
      setDidMount(false);
    };
  }, [toBtcAddress]);

  function getShuttleStatusData(hash, type = TypeTransaction.transaction) {
    let fee = out_fee ? out_fee.toString(10) : "0";
    const data = {
      hash: hash,
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount: new Big(value).minus(fee).toString(10),
      fromToken,
      toToken,
      tx_type: type,
      shuttleAddress: shuttleAddress,
      fee,
      cfxAddress: fromAddress,
    };
    return data;
  }

  const onSubmit = async () => {
    nextClick && nextClick();
    setSendStatus(SendStatus.ongoing);
    const amountVal = Big(value).mul(getExponent(18));
    try {
      const estimateData = await tokenBaseContract["burn"](
        fromAddress,
        amountVal,
        0,
        outAddress,
        ZeroAddrHex
      ).estimateGasAndCollateral({
        from: fromAddress,
        to: ctoken,
      });
      tokenBaseContract["burn"](
        fromAddress,
        amountVal,
        0,
        outAddress,
        ZeroAddrHex
      )
        .sendTransaction({
          from: fromAddress,
          to: ctoken,
          gas: calculateGasMargin(estimateData?.gasLimit, 0.5),
          storageLimit: calculateGasMargin(
            estimateData?.storageCollateralized,
            0.5
          ),
        })
        .then((data) => {
          unshiftTx(getShuttleStatusData(data));
          setSendStatus(SendStatus.success);
        })
        .catch(() => {
          setSendStatus(SendStatus.error);
        });
    } catch {
      setSendStatus(SendStatus.error);
    }
  };

  if (!didMount) {
    return null;
  }
  return (
    <>
      <Button
        className="w-[319px] ml-8"
        startIcon={<Send />}
        onClick={onSubmit}
        disabled={disabled}
        size="large"
        id="cBtcShuttleOutBtn"
      >
        {t("sendToWallet")}
      </Button>
    </>
  );
}

CbtcShuttleOutButton.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  nextClick: PropTypes.func,
  setSendStatus: PropTypes.func,
};

export default CbtcShuttleOutButton;
