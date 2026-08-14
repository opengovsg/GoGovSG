import { QueryTypes } from 'sequelize'

import { sequelize } from '../util/sequelize.js'
import { updateLinkStatistics } from '../modules/analytics/repositories/LinkStatisticsRepository.js'

/**
 * Syncs database functions.
 */
export async function syncFunctions() {
  // Initialises the link statistics database function.
  await sequelize.query(updateLinkStatistics, {
    useMaster: true,
    type: QueryTypes.RAW,
  })
}

export default syncFunctions
