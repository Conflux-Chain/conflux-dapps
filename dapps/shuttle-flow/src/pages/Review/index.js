import { useState, useEffect } from "react";
import queryString from "query-string";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { convertDecimal, formatAmount } from "@cfxjs/data-format";
import Big from "big.js";
import PropTypes from "prop-types";

import { useFromToken, useToToken } from "../../hooks/useTokenList";
import { useIsCfxChain, useIsBtcChain } from "../../hooks";
import { useBalance, useAccountStatus, useWallet } from "../../hooks/useWallet";
import { AccountStatus } from "../components";
import TokenSelect from "../Shuttle/ShuttleForm/TokenSelect";
import ChainSelect from "../Shuttle/ShuttleForm/ChainSelect";
import BtcConfirmTips from "./BtcConfirmTips";
import { TypeAccountStatus, Decimal18 } from "../../constants";
import { Button, Input } from "../../components";
import { useShuttleFee } from "../../hooks/useShuttleData";

import { DefaultFromChain, DefaultToChain } from "../../constants/chainConfig";
import { useShuttleState } from "../../state";
import { getChainIdRight } from "../../utils";
import CbtcShuttleOutButton from "./CbtcShuttleOutButton";
import { ApproveIn, ApproveOut } from "./Approve";
import { ShuttleInButton, ShuttleOutButton } from "./ShuttleButton";

function Review({ setSendStatus }) {
  const { t } = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { tokenFromBackend } = useShuttleState();

  const [btnDisabled, setBtnDisabled] = useState(true);
  const [inApproveShown, setInApproveShown] = useState(false);
  const [outApproveShown, setOutApproveShown] = useState(false);
  const {
    fromChain,
    toChain,
    fromTokenAddress,
    value,
    btcToAddress,
  } = queryString.parse(location.search);
  const {
    address: fromAddress,
    error: fromChainError,
    chainId: fromChainId,
  } = useWallet(fromChain);

  const {
    address: toAddress,
    error: toChainError,
    chainId: toChainId,
  } = useWallet(toChain);
  const isFromChainIdRight = getChainIdRight(
    fromChain,
    fromChainId,
    fromAddress
  );
  const isToChainIdRight = getChainIdRight(toChain, toChainId, toAddress);
  const isFromChainCfx = useIsCfxChain(fromChain);
  const isToChainCfx = useIsCfxChain(toChain);
  const isFromChainBtc = useIsBtcChain(fromChain);
  const isToChainBtc = useIsBtcChain(toChain);
  const isFromBtcChain = useIsBtcChain(fromChain);
  const chainOfContract = isFromChainCfx ? toChain : fromChain;
  let BtnComp = isToChainCfx ? ShuttleInButton : ShuttleOutButton;

  const { type: fromAccountType } = useAccountStatus(
    fromChain,
    fromAddress,
    fromChainError,
    isFromChainIdRight
  );
  const { type: toAccountType } = useAccountStatus(
    toChain,
    toAddress,
    toChainError,
    isToChainIdRight
  );
  let fromToken = useFromToken(fromChain, toChain, fromTokenAddress);
  fromToken =
    Object.keys(fromToken).length === 0 ? tokenFromBackend : fromToken;
  const toToken = useToToken(fromChain, toChain, fromTokenAddress);
  const shuttleFee = useShuttleFee(chainOfContract, fromToken, toChain, value);

  const { address, decimals, display_symbol } = fromToken;

  const balance = useBalance(fromChain, fromAddress, address);
  const balanceVal = balance
    ? new Big(
        convertDecimal(balance, "divide", isFromChainCfx ? Decimal18 : decimals)
      ).toString()
    : null;

  useEffect(() => {
    setBtnDisabled(true);
    if (
      (!isFromChainBtc && isToChainCfx) ||
      (isFromChainCfx && !isToChainBtc)
    ) {
      if (
        fromAddress &&
        value &&
        fromAccountType === TypeAccountStatus.success &&
        toAccountType === TypeAccountStatus.success
      ) {
        setBtnDisabled(false);
      }
    } else {
      if (isFromChainBtc && toAddress && value) {
        setBtnDisabled(false);
      }
      if (isToChainBtc && fromAddress && value) {
        setBtnDisabled(false);
      }
    }
  }, [
    value,
    fromAddress,
    isFromChainCfx,
    isFromChainBtc,
    isToChainBtc,
    isToChainCfx,
    toAddress,
    btnDisabled,
    fromAccountType,
    toAccountType,
  ]);

  const nextClick = () => {
    push("/3" + location.search);
  };

  if (!fromChain) return null;
  return (
    <div className="flex flex-col flex-1 mt-8 xl:mt-[78px] h-fit items-center">
      <div className="flex flex-col w-full border-l-2 border-[#34c759] pl-8">
        <div className="flex w-full items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            From
          </span>
          <TokenSelect
            id="fromToken"
            token={fromToken}
            type="from"
            fromChain={fromChain}
            toChain={toChain}
            disabled={true}
          />
          <ChainSelect
            chain={fromChain || DefaultFromChain}
            type="from"
            id="fromChain"
            disabled={true}
          />
          <div className="flex flex-col">
            <AccountStatus
              id="fromToken"
              chain={fromChain}
              iconClassName="absolute top-1.5"
              addressClassName="inline-block ml-8"
            />
            {fromAddress && (
              <span
                className="text-gray-60 text-xs ml-8 inline-block mt-1"
                id="balance"
              >{`${t("balance")} ${
                balanceVal ? formatAmount(balanceVal) : "--"
              }`}</span>
            )}
          </div>
        </div>
        <div className="flex w-full items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            To
          </span>
          <div className="flex">
            <TokenSelect
              id="toToken"
              token={toToken}
              type="to"
              fromChain={fromChain}
              toChain={toChain}
            />
          </div>
          <ChainSelect
            chain={toChain || DefaultToChain}
            type="to"
            fromChain={fromChain || DefaultFromChain}
            id="toChain"
            disabled={true}
          />
          <AccountStatus id="toToken" chain={toChain} />
          {isToChainBtc && <span>{btcToAddress}</span>}
        </div>
        <div className="flex w-full items-center mt-4 h-[18px]">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            Amount
          </span>
          <Input
            autoComplete="off"
            id="shuttleAmount"
            bordered={false}
            value={value}
            placeholder="0.00"
            className="!text-gray-100 !text-2lg !px-0 !bg-transparent"
            containerClassName="!bg-transparent"
            width="w-36"
            maxLength="40"
            disabled={true}
          />
        </div>
      </div>
      <div className="flex flex-col w-full border-l-2 border-[#ff9500] pl-8 mt-8 xl:mt-15">
        <div className="flex items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            Fee
          </span>
          <span className="text-black text-2lg">{`${formatAmount(
            shuttleFee
          )} ${display_symbol}`}</span>
        </div>
        <span className="inline-block mt-4 xl:mt-10 text-sm text-gray-60 opacity-70">
          There may be gas charges from your wallet
        </span>
      </div>
      {isFromBtcChain && <BtcConfirmTips />}

      <div
        className={`flex items-end ${isFromBtcChain ? "mt-4" : " mt-[83px]"}`}
      >
        <Button
          className="w-[319px]"
          size="large"
          onClick={() => {
            push(
              `./1?fromChain=${fromChain}&toChain=${toChain}&fromTokenAddress=${fromTokenAddress}`
            );
          }}
          variant="outlined"
          id="back"
        >
          Back
        </Button>
        {!isToChainBtc && isToChainCfx && (
          <ApproveIn
            fromChain={fromChain}
            toChain={toChain}
            fromToken={fromToken}
            toToken={toToken}
            value={value}
            fromAddress={fromAddress}
            toAddress={toAddress}
            disabled={false}
            setApproveShown={setInApproveShown}
            approveShown={inApproveShown}
          />
        )}
        {!isToChainBtc && !isToChainCfx && (
          <ApproveOut
            fromChain={fromChain}
            toChain={toChain}
            fromToken={fromToken}
            toToken={toToken}
            value={value}
            fromAddress={fromAddress}
            toAddress={toAddress}
            disabled={false}
            setApproveShown={setOutApproveShown}
            approveShown={outApproveShown}
          />
        )}
        {isToChainBtc && (
          <CbtcShuttleOutButton
            fromChain={fromChain}
            toChain={toChain}
            fromToken={fromToken}
            toToken={toToken}
            value={value}
            fromAddress={fromAddress}
            toAddress={toAddress}
            disabled={false}
            setSendStatus={setSendStatus}
            nextClick={nextClick}
          />
        )}
        {!isFromBtcChain &&
          !isToChainBtc &&
          !inApproveShown &&
          !outApproveShown && (
            <BtnComp
              setSendStatus={setSendStatus}
              fromChain={fromChain}
              toChain={toChain}
              fromToken={fromToken}
              toToken={toToken}
              fromAddress={fromAddress}
              toAddress={toAddress}
              value={value}
              disabled={false}
              nextClick={nextClick}
            />
          )}
      </div>
    </div>
  );
}

Review.propTypes = {
  setSendStatus: PropTypes.func,
  nextClick: PropTypes.func,
};

export default Review;
