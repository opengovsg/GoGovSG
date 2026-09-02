import assetVariant from '../../shared/util/asset-variant'

export const LOGIN_MESSAGE_KEYS = {
  gov: 'login_message_gov',
  edu: 'login_message_edu',
  health: 'login_message_health',
} as const

export const USER_MESSAGE_KEYS = {
  gov: 'user_message_gov',
  edu: 'user_message_edu',
  health: 'user_message_health',
} as const

export const ANNOUNCEMENT_KEYS = {
  gov: 'announcement_gov',
  edu: 'announcement_edu',
  health: 'announcement_health',
} as const

export type AnnouncementPayload = {
  title?: string
  subtitle?: string
  message?: string
  url?: string
  image?: string
  buttonText?: string
}

type AssetVariant = typeof assetVariant

export const getLoginMessageKey = (variant: AssetVariant = assetVariant) =>
  LOGIN_MESSAGE_KEYS[variant]

export const getUserMessageKey = (variant: AssetVariant = assetVariant) =>
  USER_MESSAGE_KEYS[variant]

export const getAnnouncementKey = (variant: AssetVariant = assetVariant) =>
  ANNOUNCEMENT_KEYS[variant]
