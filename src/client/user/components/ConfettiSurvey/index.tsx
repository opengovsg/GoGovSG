import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PopoverConfetti, useVisibleAfterDelay } from '@opengovsg/confetti'

import { GoGovReduxState } from '../../../app/reducers/types'
import { get } from '../../../app/util/requests'
import { shouldShowSurvey } from './eligibility'

const CONFETTI_API_URL = 'https://confetti.gov.sg/api/v1'
const SHOW_AFTER_MS = 5 * 1000

type ConfettiSurveyConfig = {
  surveyId?: string
  publishableKey?: string
}

const ConfettiSurvey = () => {
  const respondent = useSelector((state: GoGovReduxState) => {
    const { user, email } = state.login
    const respondentEmail = user.email ?? email
    return respondentEmail ? respondentEmail.toLowerCase() : undefined
  })
  const [survey, setSurvey] = useState<ConfettiSurveyConfig>({})
  const [isEligible, setIsEligible] = useState(false)
  const { isVisible } = useVisibleAfterDelay({ delay: SHOW_AFTER_MS })

  useEffect(() => {
    const getSurvey = async () => {
      const response = await get('/api/user/confetti')
      if (!response.ok) {
        return
      }
      setSurvey(await response.json())
    }
    getSurvey()
  }, [])

  const { surveyId, publishableKey } = survey

  // The widget's isSurveyVisible callback omits lastViewedAt, which the
  // cooldown for seen-but-unanswered surveys needs, so fetch history directly.
  useEffect(() => {
    if (!surveyId || !publishableKey || !respondent) {
      return
    }
    const getRespondentHistory = async () => {
      try {
        const response = await fetch(
          `${CONFETTI_API_URL}/cfti/${encodeURIComponent(
            surveyId,
          )}/respondent/${encodeURIComponent(respondent)}`,
          { headers: { 'x-cfti-pk': publishableKey } },
        )
        if (!response.ok) {
          return
        }
        setIsEligible(shouldShowSurvey(await response.json()))
      } catch {
        // Unreachable Confetti leaves the survey hidden.
      }
    }
    getRespondentHistory()
  }, [surveyId, publishableKey, respondent])

  if (!surveyId || !publishableKey || !respondent) {
    return null
  }

  return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
      <PopoverConfetti
        surveyId={surveyId}
        publishableKey={publishableKey}
        respondent={respondent}
        isSurveyVisible={isVisible && isEligible}
      />
    </div>
  )
}

export default ConfettiSurvey
