import {
  StepProvider,
  StepNavigation,
  StepContent,
} from '../../components/StepNavigation'
import KeepAlive from 'react-activation'

import Shuttle from '../Shuttle'
import Confirm from '../Confirm'

const DetailsContent = () => {
  return (
    <div className="flex">
      <Shuttle />
    </div>
  )
}

const ReviewContent = () => {
  return (
    <div className="bg-blue-200 h-[200px] overflow-scroll">
      <div className="h-[600px]">Review Content</div>
    </div>
  )
}

// const ConfirmContent = () => {
//   return (
//     <div className="flex">
//       <Confirm/>
//     </div>
//   )
// }

function Stepper() {
  return (
    <div className="flex flex-col items-center mt-[74px] px-[100px] pt-[58px] bg-white rounded-[8px]">
      <StepProvider
        steps={[{title: 'Details'}, {title: 'Review'}, {title: 'Confirm'}]}
      >
        <StepNavigation className="w-[520px] mt-[24px]" />
        <StepContent>
          {({next, back, currentStep}) => (
            <div>
              {currentStep.step.title === 'Details' && (
                <KeepAlive>
                  <DetailsContent next={next}/>
                </KeepAlive>
              )}
              {currentStep.step.title === 'Review' && (
                <KeepAlive>
                  <ReviewContent />
                </KeepAlive>
              )}
              {currentStep.step.title === 'Confirm' && (
                <KeepAlive>
                  <Confirm back={back}/>
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
