import { HomeStatistics, LinksToRotate } from '../reducers/types.js'
import { ReduxPayloadAction } from '../../app/actions/types.js'

export const LOAD_STATS = 'LOAD_STATS'
export const SET_LINKS_TO_ROTATE = 'SET_LINKS_TO_ROTATE'

export type LoadStatsAction = ReduxPayloadAction<
  typeof LOAD_STATS,
  HomeStatistics
>

export type SetLinksToRotateAction = ReduxPayloadAction<
  typeof SET_LINKS_TO_ROTATE,
  LinksToRotate
>

export type HomeActionType = SetLinksToRotateAction | LoadStatsAction
