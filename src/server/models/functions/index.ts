import { QueryTypes } from 'sequelize'

import { sequelize } from '../../util/sequelize'
import {
  dropLinkStatistics,
  updateLinkStatistics,
} from './updateLinkStatistics'

/**
 * Syncs database functions.
 */
export async function syncFunctions() {
  // Removes any previous implementations of link statistics.
  await sequelize.query(dropLinkStatistics, {
    type: QueryTypes.RAW,
  })

  // Initialises the link statistics database function.
  await sequelize.query(updateLinkStatistics, {
    type: QueryTypes.RAW,
  })
}

export default syncFunctions
