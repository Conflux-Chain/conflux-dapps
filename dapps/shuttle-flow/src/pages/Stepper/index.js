import {
  StepProvider,
  StepNavigation,
  StepContent,
} from '../../components/StepNavigation'
import KeepAlive from 'react-activation'
import {useState} from 'react'

import Shuttle from '../Shuttle'
import Review from '../Review'
import Confirm from '../Confirm'

const DetailsContent = () => {
  return (
    <div className="flex">
      <Shuttle />
    </div>
  )
}

// const ReviewContent = ({}) => {
//   return (
//     <div className="flex">
//       <Review />
//     </div>
//   )
// }

// const ConfirmContent = () => {
//   return (
//     <div className="flex">
//       <Confirm/>
//     </div>
//   )
// }

function Stepper() {
  const [sendStatus, setSendStatus] = useState('')
  return (
    <div className="flex flex-col items-center mt-[12px] px-[100px] xl:mt-[74px]">
      <StepProvider
        steps={[{title: 'Details'}, {title: 'Review'}, {title: 'Confirm'}]}
      >
        <StepNavigation className="w-[520px] mt-[24px]" />
        <StepContent>
          {({next, back, currentStep}) => (
            <div>
              {currentStep.step.title === 'Details' && (
                <KeepAlive>
                  <DetailsContent next={next} />
                </KeepAlive>
              )}
              {currentStep.step.title === 'Review' && (
                <KeepAlive>
                  <Review setSendStatus={setSendStatus} nextClick={next} />
                </KeepAlive>
              )}
              {currentStep.step.title === 'Confirm' && (
                <KeepAlive>
                  <Confirm back={back} sendStatus={sendStatus} />
                </KeepAlive>
              )}
              {/* <button onClick={back}>click go back</button> */}
              {/* <button className="ml-[10px]" onClick={next}>
                click to next
              </button> */}

              {/* <div>
                CurrentStep: {currentStep.index + 1} {currentStep.step.title}
              </div> */}
            </div>
          )}
        </StepContent>
      </StepProvider>
    </div>
  )
}

export default Stepper
