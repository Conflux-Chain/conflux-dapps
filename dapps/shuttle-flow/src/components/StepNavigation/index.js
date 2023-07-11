import React, {
  createContext,
  useContext,
  useMemo,
  Fragment,
  useCallback,
} from 'react'
import {NavLink, useHistory, useLocation} from 'react-router-dom'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import escapeRegExp from 'lodash/escapeRegExp'
import './index.css'

const StepsContext = createContext({steps: undefined})
const useStepsContext = () => useContext(StepsContext)
// interface Step {
//   title: string
//   path?: string
// }

export const StepNavigation = ({className}) => {
  const {steps} = useStepsContext()

  return (
    <div className={classNames('flex justify-between', className)}>
      {steps?.map((step, index) => (
        <Fragment key={step.title}>
          <NavLink
            className="relative inline-flex flex-col items-center shrink-0 grow-0 text-[rgba(66,66,66,0.7)] pointer-events-none"
            activeClassName="step-navigation-link--active !text-white pointer-events-none"
            to={`./${step.path ? step.path : index + 1}${location.search}`}
          >
            {index !== steps.length - 1 && (
              <span className="absolute w-[calc(50%-12px)] right-0 top-[11px] h-[2px] bg-[rgba(66,66,66,0.7)] pointer-events-none select-none -z-[1]" />
            )}
            {index !== 0 && (
              <span className="absolute w-[calc(50%-12px)] left-0 top-[11px] h-[2px] bg-[rgba(66,66,66,0.7)] pointer-events-none select-none -z-[1]" />
            )}
            <span className="step-navigation-circle mb-[8px] inline-flex justify-center items-center w-[26px] h-[26px] rounded-full border-[1px] bg-[rgba(66,66,66,0.7)] text-inherit z-0">
              {index + 1}
            </span>
            <span className="text-[rgba(66,66,66,0.7)]">{step.title}</span>
          </NavLink>
          {index !== steps.length - 1 && (
            <div className="w-full mt-[11px] h-[2px] bg-[rgba(66,66,66,0.7)] pointer-events-none select-none" />
          )}
        </Fragment>
      ))}
    </div>
  )
}

StepNavigation.propTypes = {
  className: PropTypes.string,
}

export const StepContent = ({children}) => {
  const {steps} = useStepsContext()
  const {push} = useHistory()
  const location = useLocation()
  const currentStep = useMemo(() => {
    const stepIndex = steps?.findIndex(
      (step, index) =>
        (step.path || `/${index + 1}`).search(
          new RegExp(escapeRegExp(location.pathname), 'i'),
        ) !== -1,
    )
    if (stepIndex !== -1) {
      return {step: steps?.[stepIndex], index: stepIndex}
    } else return null
  }, [location.pathname, steps])

  const next = useCallback(() => {
    if (!currentStep) return
    const nextStep = steps?.[currentStep.index + 1]
    if (!nextStep) return
    push(`./${nextStep.path ? nextStep.path : currentStep.index + 1 + 1}`)
  }, [currentStep, steps, push])
  const back = useCallback(() => {
    if (!currentStep) return
    const backStep = steps?.[currentStep.index - 1]
    if (!backStep) return
    push(`./${backStep.path ? backStep.path : currentStep.index - 1 + 1}`)
  }, [currentStep, steps, push])
  if (typeof children !== 'function') return null;
  return children({next, back, currentStep})
}

StepContent.propTypes = {
  children: PropTypes.func.isRequired,
}

export const StepProvider = ({steps, children}) => {
  return (
    <StepsContext.Provider value={{steps}}>{children}</StepsContext.Provider>
  )
}

StepProvider.propTypes = {
  steps: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
