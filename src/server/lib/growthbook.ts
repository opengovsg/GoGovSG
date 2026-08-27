import assetVariant from '../../shared/util/asset-variant'

export const LOGIN_MESSAGE_GOV = 'login_message_gov'
export const LOGIN_MESSAGE_EDU = 'login_message_edu'
export const LOGIN_MESSAGE_HEALTH = 'login_message_health'

export const USER_MESSAGE_GOV = 'user_message_gov'
export const USER_MESSAGE_EDU = 'user_message_edu'
export const USER_MESSAGE_HEALTH = 'user_message_health'

export const ANNOUNCEMENT_GOV = 'announcement_gov'
export const ANNOUNCEMENT_EDU = 'announcement_edu'
export const ANNOUNCEMENT_HEALTH = 'announcement_health'

export type AnnouncementPayload = {
  title?: string
  subtitle?: string
  message?: string
  url?: string
  image?: string
  buttonText?: string
}

type AssetVariant = typeof assetVariant

const loginMessageKeys: Record<AssetVariant, string> = {
  gov: LOGIN_MESSAGE_GOV,
  edu: LOGIN_MESSAGE_EDU,
  health: LOGIN_MESSAGE_HEALTH,
}

const userMessageKeys: Record<AssetVariant, string> = {
  gov: USER_MESSAGE_GOV,
  edu: USER_MESSAGE_EDU,
  health: USER_MESSAGE_HEALTH,
}

const announcementKeys: Record<AssetVariant, string> = {
  gov: ANNOUNCEMENT_GOV,
  edu: ANNOUNCEMENT_EDU,
  health: ANNOUNCEMENT_HEALTH,
}

export const getLoginMessageKey = (variant: AssetVariant = assetVariant) =>
  loginMessageKeys[variant]

export const getUserMessageKey = (variant: AssetVariant = assetVariant) =>
  userMessageKeys[variant]

export const getAnnouncementKey = (variant: AssetVariant = assetVariant) =>
  announcementKeys[variant]
