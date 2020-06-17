import { sequelize } from '../util/sequelize'
import { Url, UrlHistory } from './url'
import { User } from './user'
import { Clicks } from './statistics/clicks'
import { HeatMap } from './statistics/heatmap'
import { Devices } from './statistics/devices'

// One user can create many urls but each url can only be mapped to one user.
User.hasMany(Url, { as: 'Urls', foreignKey: { allowNull: false } })
Url.belongsTo(User, { foreignKey: { allowNull: false } })

// A Url record can have many updates by many users
User.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(User, { foreignKey: { allowNull: false } })

// A Url record can have various rows of relevant statistics.
Url.hasMany(Clicks, { foreignKey: { allowNull: false } })
Url.hasMany(HeatMap, { foreignKey: { allowNull: false } })
Url.hasMany(Devices, { foreignKey: { allowNull: false } })

/**
 * Initialise the database table.
 */
export default async () => {
  await sequelize.sync()
}
