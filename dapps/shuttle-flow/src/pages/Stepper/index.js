import {
  StepProvider,
  StepNavigation,
  StepContent,
} from '../../components/StepNavigation'
import KeepAlive from 'react-activation'

import Shuttle from '../Shuttle'

const DetailsContent = () => {
  return (
    <div className="bg-red-200 h-[200px] overflow-scroll">
      <div className="h-[600px]"><Shuttle /></div>
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

const ConfirmContent = () => {
  return (
    <div className="bg-green-200 h-[200px] overflow-scroll">
      <div className="h-[600px]">Confirm Content</div>
    </div>
  )
}

function Stepper() {
  <StepProvider
        steps={[{title: 'Details'}, {title: 'Review'}, {title: 'Confirm'}]}
      >
        <StepNavigation className="w-[520px] mt-[24px]" />
        <StepContent>
          {({next, back, currentStep}) => (
            <div>
              {currentStep.step.title === 'Details' && (
                <KeepAlive>
                  <DetailsContent />
                </KeepAlive>
              )}
              {currentStep.step.title === 'Review' && (
                <KeepAlive>
                  <ReviewContent />
                </KeepAlive>
              )}
              {currentStep.step.title === 'Confirm' && (
                <KeepAlive>
                  <ConfirmContent />
                </KeepAlive>
              )}
              <button onClick={back}>click go back</button>
              <button className="ml-[10px]" onClick={next}>
                click to next
              </button>

              <div>
                CurrentStep: {currentStep.index + 1} {currentStep.step.title}
              </div>
            </div>
          )}
        </StepContent>
      </StepProvider>
}

export default Stepper
