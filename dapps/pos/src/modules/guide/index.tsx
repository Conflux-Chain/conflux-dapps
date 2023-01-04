import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cx from 'clsx';
import Button from 'common/components/Button';
import CheckBox from '../../components/CheckBox';

const guide = {
    RiskWarning: {
        title: 'Risk warning',
        notices: [
            {
                title: 'Some operations may cause your pending staking token to be permanently locked, including but not limited to:',
                content: (
                    <>
                        1. Modify the codes of Conflux-rust, resulting in a certain kind of consensus-breaking behavior in your PoS account.
                        <br />
                        2. Use the same PoS private key and address for running multiple PoS nodes. (Therefore, it is not recommended to copy the POS private
                        key file elsewhere.)
                        <br />
                        3. The theft of the PoS private key which causes the above phenomenon.
                        <br />
                        4. The PoW address private key bound to the PoS private key is lost, failing to issue the unlocking instruction.\nNote: If the PoS
                        private key is lost but not stolen, it will not cause capital loss. Use the PoW address to send the unlocking instruction.
                    </>
                ),
            },
            {
                title: 'Some operations may cause your staking token to automatically enter the unlocking state, including but not limited to:',
                content: (
                    <>
                        After being selected into the PoS Committee, fail to bear the responsibility of a committee member to vote for the PoS block for over
                        one epoch (about one hour) due to the program abort, network failure, malicious attack, or other reasons. <br />
                        Note: In this case, when all staking is completely unlocked, the PoS address will return to normal.
                    </>
                ),
            },
            {
                title: 'Some operations may result in not getting any rewards, including but not limited to: ',
                content: <>Fail to launch the PoS node or connect to the PoS network. </>,
            },
            {
                title: 'If you transfer the CFX token to another contract / private key address, the contract operator / private key owner shall be fully responsible for the security of the fund.',
                content: <></>,
            },
            {
                title: 'After sending the unlocking instruction, the actual unlocking time of the token shall be subject to the later one of the two given dates:',
                content: (
                    <>
                        1. 7 days after sending the unlocking instruction
                        <br />
                        2. 14 days after locking the token is locked in multiple batches, the unlocking time of each batch shall be calculated separately.
                    </>
                ),
            },
        ],
    },
    steps: {
        title: 'PoS mining steps',
        contentTitle:
            'You need to upgrade your node before Epoch Number reaches 36935000 or Block Number reaches 92060600 (around 12:00 Feb.23rd, 2022(GMT+8))',
        contentDesc: (
            <>
                1. Replace conflux.exe with the new one in Conflux v2.0.0, then restart the fullnode. Download link:{' '}
                <a className="text-gray-400 " href="https://github.com/Conflux-Chain/conflux-rust/releases" target="_blank" rel="noopener">
                    https://github.com/Conflux-Chain/conflux-rust/releases
                </a>
                <br />
                2. The PoS registration will start at Epoch Number 36935000 or Block Number 92060600 (around Feb.23rd at 12:00, 2022). Reference, PoS
                Registration Tutorial:
                <a className="text-gray-400" href="https://forum.conflux.fun/t/pos-registration-tutorial-conflux-v2-0-0/13469" target="_blank" rel="noopener">
                    https://forum.conflux.fun/t/pos-registration-tutorial-conflux-v2-0-0/13469
                </a>
                <br />
                3. The PoS registration will close at Block Number 92406200 (around Feb.25th at 12:00, 2022). After registration closes, you can start adding
                pos_config. Reference, PoS Transition Tutorial:{' '}
                <a className="text-gray-400 " href="https://forum.conflux.fun/t/pos-transition-tutorial-conflux-v2-0-0/13470" target="_blank" rel="noopener">
                    https://forum.conflux.fun/t/pos-transition-tutorial-conflux-v2-0-0/13470
                </a>
                <br />
                4. The deadline for adding pos_config is before Epoch Number reaches 37230000 (around Feb.28th 12:00, 2022). Hardfork upgrade will be completed
                at this time.
            </>
        ),
    },
};

interface Props {
    isRegister: boolean;
}

const Guide: React.FC<Props> = ({ isRegister }) => {
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);
    const onClick = useCallback(() => {
        setChecked((pre) => !pre);
    }, []);

    const onNext = useCallback(() => {
        localStorage.setItem('posAcceptedGuide', 'true');
        navigate('/pos/resigter');
    }, []);

    return (
        <div className={cx('relative bg-white', !isRegister && 'mt-[16px] mx-auto w-[1142px] rounded-[8px] px-[24px] pt-[24px] pb-[36px] mb-[40px]')}>
            <div>
                <div className="font-medium text-[28px] text-[#3D3F4C]">{guide.RiskWarning.title}</div>
                <div>
                    {guide.RiskWarning.notices.map((note, index) => {
                        return (
                            <div key={note.title}>
                                <div className="mt-[16px] w-[64px] h-[24px] leading-[24px] rounded-[4px] bg-[#FCF1E8] text-[12px] text-[#F0955F] text-center">
                                    Notice {index + 1}
                                </div>
                                <div className="my-[8px] text-[14px] text-[#3D3F4C] font-medium">{note.title}</div>
                                <div className="leading-[18px] text-[14px] text-[#898D9A]">{note.content}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-[24px]">
                <div className="font-medium text-[20px] text-[#3D3F4C]">{guide.steps.title}</div>
                <div className="font-medium text-[14px] text-[#3D3F4C] mt-[2px]">{guide.steps.contentTitle}</div>
                <div className="text-[#898D9A] text-[14px] leading-[18px] mt-[8px]">{guide.steps.contentDesc}</div>
            </div>
            {!isRegister && (
                <div className="flex flex-col items-center mt-[24px]">
                    <div className="flex flex-row justify-center items-center">
                        <CheckBox checked={checked} onChange={onClick}>
                            I accepted
                        </CheckBox>
                    </div>
                    <Button disabled={!checked} className="mt-[16px] w-[510px]" onClick={onNext}>
                        Stake votes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Guide;
