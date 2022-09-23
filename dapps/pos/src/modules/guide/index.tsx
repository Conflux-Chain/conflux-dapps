import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import Button from 'common/components/Button';
import CheckBox from '../../components/CheckBox';

const guide = {
  "RiskWarning": {
    "title": "Risk warning",
    "notices": [
      {
        "title": "Some operations may cause your pending staking token to be permanently locked, including but not limited to:",
        "content": <>1. Modify the codes of Conflux-rust, resulting in a certain kind of consensus-breaking behavior in your PoS account.<br />2. Use the same PoS private key and address for running multiple PoS nodes. (Therefore, it is not recommended to copy the POS private key file elsewhere.)<br />3. The theft of the PoS private key which causes the above phenomenon.<br />4. The PoW address private key bound to the PoS private key is lost, failing to issue the unlocking instruction.\nNote: If the PoS private key is lost but not stolen, it will not cause capital loss. Use the PoW address to send the unlocking instruction.</>
      }, {
        "title": "Some operations may cause your staking token to automatically enter the unlocking state, including but not limited to:",
        "content": <>After being selected into the PoS Committee, fail to bear the responsibility of a committee member to vote for the PoS block for over one epoch (about one hour) due to the program abort, network failure, malicious attack, or other reasons. <br />Note: In this case, when all staking is completely unlocked, the PoS address will return to normal.</>
      }, {
        "title": "Some operations may result in not getting any rewards, including but not limited to: ",
        "content": <>Fail to launch the PoS node or connect to the PoS network. </>
      }, {
        "title": "If you transfer the CFX token to another contract / private key address, the contract operator / private key owner shall be fully responsible for the security of the fund.",
        "content": <></>
      }, {
        "title": "After sending the unlocking instruction, the actual unlocking time of the token shall be subject to the later one of the two given dates:",
        "content": <>1. 7 days after sending the unlocking instruction<br />2. 14 days after locking the token is locked in multiple batches, the unlocking time of each batch shall be calculated separately.</>
      }
    ]
  },
  "steps": {
    "title": "PoS mining steps",
    "contentTitle": "You need to upgrade your node before Epoch Number reaches 36935000 or Block Number reaches 92060600 (around 12:00 Feb.23rd, 2022(GMT+8))",
    "contentDesc": <>1. Replace conflux.exe with the new one in Conflux v2.0.0, then restart the fullnode. Download link: <a className='text-gray-400 '>https://github.com/Conflux-Chain/conflux-rust/releases</a><br />2. The PoS registration will start at Epoch Number 36935000 or Block Number 92060600 (around Feb.23rd at 12:00, 2022). Reference, PoS Registration Tutorial:<a className='text-gray-400 '>https://forum.conflux.fun/t/pos-registration-tutorial-conflux-v2-0-0/13469</a><br />3. The PoS registration will close at Block Number 92406200 (around Feb.25th at 12:00, 2022). After registration closes, you can start adding pos_config. Reference, PoS Transition Tutorial: <a className='text-gray-400 '>https://forum.conflux.fun/t/pos-transition-tutorial-conflux-v2-0-0/13470</a><br />4. The deadline for adding pos_config is before Epoch Number reaches 37230000 (around Feb.28th 12:00, 2022). Hardfork upgrade will be completed at this time.</>
  }
}

const Guide: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const onClick = useCallback(() => {
    setChecked(pre => !pre);
  }, []);

  return (
    <>
      <div>
        <div className='font-medium text-3xl'>{guide.RiskWarning.title}</div>
        <div>
          {guide.RiskWarning.notices.map((note, index) => {
            return (
              <div key={note.title}>
                <div className='mt-4 w-16 h-6 bg-[#FCF1E8] text-orange-400 flex items-center justify-center'>Notice {index + 1}</div>
                <div className='mt-3 font-medium'>{note.title}</div>
                <div className='text-gray-400'>{note.content}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='mt-6'>
        <div className='font-medium text-xl'>{guide.steps.title}</div>
        <div className='font-medium mt-0.5'>{guide.steps.contentTitle}</div>
        <div className='text-gray-400 mt-2'>{guide.steps.contentDesc}</div>
      </div>
      <div className='flex flex-col items-center'>
        <div className='flex flex-row justify-center items-center'>
          <CheckBox checked={checked} onClick={onClick}>
            I accepted
          </CheckBox>
        </div>
        <Button disabled={!checked} className={cx('w-4/5 max-w-lg')}>Stake votes</Button>
      </div>
    </>
  )
}

export default Guide;