import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount as useConfluxAccount, sendTransaction } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useNavigate, Link } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import Networks from 'common/conf/Networks';
import { fetchChain } from 'common/utils/fetchChain';
import QuestionMark from 'common/assets/icons/QuestionMark.svg';
import Input from 'common/components/Input';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import TextPrefix from 'common/components/Input/suffixes/TextPrefix';
import Button from 'common/components/Button';
import Warning from 'common/assets/icons/warning2.svg';
import { showTipModal } from 'governance/src/components/TipModal';
import { useMaxCanLockVotes } from 'pos/src/store';
import { showModal, hideModal } from 'pos/src/components/showModal';
import Textarea from 'pos/src/components/Textarea';
import SvgLoading from 'pos/src/assets/Loading';
import { posContractAddress } from 'pos/src/utils/contracts';
import { checkPosData } from 'pos/src/utils';
import Guide from '../Guide';

const Register: React.FC = () => {
    const {
        register,
        handleSubmit: withForm,
        formState: { errors },
        setValue,
    } = useForm();
    const navigate = useNavigate();
    const maxCanLockVotes = useMaxCanLockVotes();
    const account = useConfluxAccount();

    const registerAndLock = useCallback(async (posData: string, inputVote: number) => {
        const zeros = '0000000000000000000000000000000000000000000000000000000000000000';
        const votes = (zeros + Number(inputVote).toString(16)).substr(-64);
        const data = posData.substr(0, 74) + votes + posData.substr(138, posData.length);
        const txParams = {
            from: account,
            to: posContractAddress,
            data,
        };
        let estimateData: { gasLimit?: string; storageCollateralized?: string } = {};
        try {
            estimateData = await fetchChain({
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_estimateGasAndCollateral',
                params: [txParams, 'latest_state'],
            });
        } catch (error) {
            throw error;
        }
        try {
            const txHash = await sendTransaction({
                ...txParams,
                gas: estimateData?.gasLimit || '0x0',
                storageLimit: estimateData?.storageCollateralized || '0x0',
            });
            return txHash;
        } catch (error) {
            throw error;
        }
    }, []);

    const handleClickQuestionMark = useCallback(() => {
        showTipModal(BindCurrentAddressTipContent);
    }, []);

    const onSubmit = useCallback(
        withForm(async (data) => {
            try {
                showModal(RegisterWaitingContent);
                await registerAndLock(data.nodeData, data.stakeVotes);
                setTimeout(() => {
                    hideModal();
                    navigate('/pos/increase', { state: { status: 'wait-bound-confirm' } });
                }, 4000);
            } catch (error) {
                hideModal();
            }
        }),
        []
    );

    useEffect(() => {
        setValue('stakeVotes', '');
    }, [account]);

    return (
        <div className="relative w-[1142px] h-[712px] mt-[16px] mx-auto mb-[24px] rounded-[8px] p-[24px] grid grid-cols-2 bg-white">
            <div className="pr-[36px] border-r-[1px] border-[#EAECEF]">
                <div className="mb-[16px] text-[28px] leading-[36px] color-[#3D3F4C] font-medium">Stake votes in PoS</div>
                <form onSubmit={onSubmit}>
                    <label htmlFor="bind-address-input">
                        <div className="mb-[12px] flex items-center text-[16px] leading-[22px] color-[#383838] font-medium">
                            Bind the address of the current wallet
                            <img
                                src={QuestionMark}
                                alt="question mark"
                                className="ml-[5px] hover:scale-110 transition-transform select-none cursor-pointer"
                                onClick={handleClickQuestionMark}
                            />
                        </div>
                        <Input {...register('bindAddress')} defaultValue={account} id="bind-address-input" disabled={true} bindAccout={account} />
                    </label>
                    <label htmlFor="node-data-input" className="relative">
                        <div className="mt-[16px] mb-[12px] flex justify-between text-[16px] leading-[22px] text-[#383838] font-medium">
                            <span>Full node data</span>
                            <a
                                className="!text-[#808BE7] hover:underline font-normal"
                                href="https://forum.conflux.fun/t/pos-registration-tutorial-conflux-v2-0-0-fix/13469"
                                target="_blank"
                            >
                                How to get data?
                            </a>
                        </div>
                        <Textarea {...register('nodeData', { required: true, validate: checkPosData })} className="h-[112px]" id="node-data-input" />
                        {errors.nodeData && <span className="absolute -bottom-[16px] left-0 text-[12px] text-[#e96170]">Invalid full node data</span>}
                    </label>
                    <label htmlFor="stakeVotes">
                        <div className="mt-[16px] mb-[12px] flex justify-between text-[16px] leading-[22px] text-[#383838] font-medium">Staked Votes</div>
                        <Input
                            id="stakeVotes"
                            {...register('stakeVotes', {
                                required: true,
                                min: 1,
                                max: maxCanLockVotes ?? 0,
                            })}
                            min={1}
                            max={maxCanLockVotes ?? 0}
                            type="number"
                            step={1}
                            suffix={[<InputMAXSuffix id="pos-stake-max" />, <TextPrefix text="Votes" />]}
                        />
                        <div className="flex justify-between items-center mt-[8px] mb-[16px]">
                            <div className="">
                                <div className="text-14px text-[#898D9A]">
                                    Stakable: <span className="text-[#3D3F4C]">{maxCanLockVotes ?? 0}</span>
                                </div>
                                <div className="mt-[8px] text-12px text-[#3D3F4C]">1 vote = 1,000 CFX</div>
                            </div>
                            <Link to="/governance/dashboard" className="no-underline">
                                <Button className="w-[82px] h-[32px]" variant="outlined" size="small">
                                    Get more
                                </Button>
                            </Link>
                        </div>
                    </label>
                    <div className="mb-[24px] pl-[48px] pr-[16px] py-[13px] rounded-[4px] bg-[#FCF1E8]">
                        <div className="relative text-[16px] leading-[22px] text-[#3D3F4C]">
                            <img src={Warning} alt="warning image" className="absolute -left-[34px] top-[47%] -translate-y-[50%] w-[24px] h-[24px]" />
                            Tips
                        </div>
                        <div className="mt-[8px] text-[14px] leading-[18px] text-[#3D3F4C]">
                            After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.
                        </div>
                    </div>
                    <AuthCoreSpace
                        id="pos-bind-auth"
                        size="large"
                        fullWidth
                        type="button"
                        authContent={() => (
                            <Button id="pos-bind" size="large" fullWidth>
                                Register and Bind
                            </Button>
                        )}
                    />
                </form>
                <a
                    className="mt-[12px] mx-auto block w-fit !text-[#808BE7] hover:underline"
                    href="https://forum.conflux.fun/t/guideline-for-the-usage-of-conflux-governance-beta-conflux-v2-0-0-testnet/12591"
                    target="_blank"
                    rel="noopener"
                >
                    Need help
                </a>
            </div>
            <CustomScrollbar contentClassName="ml-[36px] h-[664px]">
                <Guide isRegister={true} />
            </CustomScrollbar>
        </div>
    );
};

const BindCurrentAddressTipContent: React.FC = () => (
    <>
        <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Bind the address of the current wallet</div>
        <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">Bind the POS node to the current wallet address</div>
    </>
);

const RegisterWaitingContent: React.FC = () => (
    <div className="flex flex-col items-center">
        <SvgLoading className="animate-spin text-gray-20 w-12 h-12" />
        <div className="text-[16px] leading-[22px] font-medium text-[#1B1B1C]">Waiting</div>
        <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A] text-center">
            After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in{' '}
            <span className="font-medium text-[#1B1B1C]">about 10 minutes</span>.
        </div>
    </div>
);

export default Register;
