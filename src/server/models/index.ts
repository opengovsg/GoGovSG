import { sequelize } from '../util/sequelize'
import { Url, UrlHistory } from './url'
import { User } from './user'
import { Clicks } from './statistics/daily'
import { WeekdayClicks } from './statistics/weekday'
import { Devices } from './statistics/devices'

// One user can create many urls but each url can only be mapped to one user.
User.hasMany(Url, { as: 'Urls', foreignKey: { allowNull: false } })
Url.belongsTo(User, { foreignKey: { allowNull: false } })

// A Url record can have many updates by many users
User.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(User, { foreignKey: { allowNull: false } })

// A Url record can have various rows of relevant statistics.
Url.hasMany(Clicks, { foreignKey: 'shortUrl', as: 'DailyClicks' })
Url.hasMany(WeekdayClicks, { foreignKey: 'shortUrl', as: 'WeekdayClicks' })
Url.hasOne(Devices, { foreignKey: 'shortUrl', as: 'DeviceClicks' })
Clicks.belongsTo(Url, { foreignKey: 'shortUrl' })
WeekdayClicks.belongsTo(Url, { foreignKey: 'shortUrl' })
Devices.belongsTo(Url, { foreignKey: 'shortUrl' })

/**
 * Initialise the database table.
 */
export default async () => {
  await sequelize.sync()
}
