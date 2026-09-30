const SEEN_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000

export type RespondentHistory = {
  lastRespondedAt: string | null
  lastViewedAt: string | null
  lastDismissedAt: string | null
}

const isWithinCooldown = (timestamp: string | null) =>
  !!timestamp && Date.now() - Date.parse(timestamp) < SEEN_COOLDOWN_MS

export const shouldShowSurvey = ({
  lastRespondedAt,
  lastViewedAt,
  lastDismissedAt,
}: RespondentHistory) =>
  !lastRespondedAt &&
  !isWithinCooldown(lastViewedAt) &&
  !isWithinCooldown(lastDismissedAt)
