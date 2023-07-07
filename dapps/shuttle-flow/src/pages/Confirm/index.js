import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import { SendStatus } from "../../constants";
import { StatusError, StatusSuccess, StatusWaiting } from "../../assets/img";

function Confirm({ sendStatus }) {
  const { t } = useTranslation();
  const { push } = useHistory();
  const location = useLocation();
  const { fromChain, toChain, fromTokenAddress } = queryString.parse(
    location.search
  );

  return (
    <div className="flex flex-col mt-20">
      {(!sendStatus || sendStatus == SendStatus.ongoing) && (
        <div>
          <div className="flex justify-center">
            <img className="w-16" src={StatusWaiting} alt="tunnel" />
          </div>
          <div className="mt-8 font-medium text-black text-lg">
            Please confirm in your wallet to complete transaction.
          </div>
          <div className="mt-4 text-base text-black opacity-50 text-center">
            This page will refresh automatically
          </div>
          <div className="flex justify-center mt-[60px]">
            <button
              className=" w-[319px] h-[48px] border border-black border-solid text-black bg-white rounded-md font-medium"
              size="large"
              onClick={() => push("/2" + location.search)}
              id="back"
            >
              {t("back")}
            </button>
          </div>
        </div>
      )}
      {sendStatus == SendStatus.success && (
        <div>
          <div className="flex justify-center">
            <img className="w-16" src={StatusSuccess} alt="tunnel" />
          </div>
          <div className="mt-8 font-medium text-black text-lg text-center">
            All done. Kudos!
          </div>
          <div className="flex justify-center mt-[60px]">
            <button
              className=" w-[319px] h-[48px] border border-black border-solid text-black bg-white rounded-md font-medium"
              size="large"
              onClick={() => push("/1" + location.search)}
              id="newTx"
            >
              {t("newTx")}
            </button>
          </div>
        </div>
      )}
      {sendStatus == SendStatus.error && (
        <div>
          <div className="flex justify-center">
            <img className="w-16" src={StatusError} alt="tunnel" />
          </div>
          <div className="mt-8 font-medium text-black text-lg text-center">
            You have declined the transaction in your wallet.
          </div>
          <div className="flex justify-between mt-[60px]">
            <button
              className="w-[319px] h-[48px] border border-black border-solid text-black bg-white rounded-md font-medium"
              size="large"
              onClick={() => push("/2" + location.search)}
              id="back"
            >
              {t("back")}
            </button>
            <button
              className="ml-6 w-[319px] h-[48px] border border-black border-solid text-white bg-black rounded-md font-medium"
              size="large"
              onClick={() =>
                push(
                  `./1?fromChain=${fromChain}&toChain=${toChain}&fromTokenAddress=${fromTokenAddress}`
                )
              }
              id="startOver"
            >
              {t("startOver")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Confirm.propTypes = {
  sendStatus: PropTypes.oneOf([...Object.values(SendStatus), ""]).isRequired,
  back: PropTypes.func,
  setSendStatus: PropTypes.func,
};

export default Confirm;
