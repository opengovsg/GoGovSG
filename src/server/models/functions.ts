import { QueryTypes } from 'sequelize'

import { sequelize } from '../util/sequelize'
import { updateLinkStatistics } from '../repositories/LinkStatisticsRepository'

/**
 * Syncs database functions.
 */
export async function syncFunctions() {
  // Initialises the link statistics database function.
  await sequelize.query(updateLinkStatistics, {
    type: QueryTypes.RAW,
  })
}

export default syncFunctions
