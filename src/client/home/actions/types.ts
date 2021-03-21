import { HomeStatistics, LinksToRotate } from '../reducers/types'
import { HasPayload, ReduxAction } from '../../app/actions/types'

export const LOAD_STATS = 'LOAD_STATS'
export const SET_LINKS_TO_ROTATE = 'SET_LINKS_TO_ROTATE'

export type LoadStatsAction = ReduxAction<typeof LOAD_STATS> &
  HasPayload<HomeStatistics>

export type SetLinksToRotateAction = ReduxAction<typeof SET_LINKS_TO_ROTATE> &
  HasPayload<LinksToRotate>

export type HomeActionType = SetLinksToRotateAction | LoadStatsAction
