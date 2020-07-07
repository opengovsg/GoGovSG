import { QueryTypes } from 'sequelize'

import { sequelize } from '../../util/sequelize'
import {
  dropLinkStatistics,
  updateLinkStatistics,
} from './updateLinkStatistics'

// Removes any previous implementations of link statistics.
sequelize.query(dropLinkStatistics, {
  type: QueryTypes.RAW,
})

// Initialises the link statistics database function.
sequelize.query(updateLinkStatistics, {
  type: QueryTypes.RAW,
})
