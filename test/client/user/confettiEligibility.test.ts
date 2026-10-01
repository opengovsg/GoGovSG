import { shouldShowSurvey } from '../../../src/client/user/components/ConfettiSurvey/eligibility'

const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString()

const neverSeen = {
  lastRespondedAt: null,
  lastViewedAt: null,
  lastDismissedAt: null,
}

describe('shouldShowSurvey', () => {
  test('shows to a respondent who has never seen it', () => {
    expect(shouldShowSurvey(neverSeen)).toBe(true)
  })

  test('never shows again after a response', () => {
    expect(
      shouldShowSurvey({ ...neverSeen, lastRespondedAt: daysAgo(30) }),
    ).toBe(false)
  })

  test('hides within 2 days of a view', () => {
    expect(shouldShowSurvey({ ...neverSeen, lastViewedAt: daysAgo(1) })).toBe(
      false,
    )
  })

  test('shows again 2 days after a view', () => {
    expect(shouldShowSurvey({ ...neverSeen, lastViewedAt: daysAgo(2) })).toBe(
      true,
    )
  })

  test('hides within 2 days of a dismiss', () => {
    expect(
      shouldShowSurvey({
        ...neverSeen,
        lastViewedAt: daysAgo(3),
        lastDismissedAt: daysAgo(1),
      }),
    ).toBe(false)
  })
})
