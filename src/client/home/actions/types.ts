import { HomeStatistics, LinksToRotate } from '../reducers/types'

export const LOAD_STATS = 'LOAD_STATS'
export const SET_LINKS_TO_ROTATE = 'SET_LINKS_TO_ROTATE'

export type LoadStatsAction = {
  type: typeof LOAD_STATS
  payload: HomeStatistics
}

export type SetLinksToRotateAction = {
  type: typeof SET_LINKS_TO_ROTATE
  payload: LinksToRotate
}

export type HomeActionType = SetLinksToRotateAction | LoadStatsAction
