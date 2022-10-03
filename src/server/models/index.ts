import { sequelize } from '../util/sequelize'
import { Url, UrlHistory } from './url'
import { User } from './user'
import { DailyClicks } from './statistics/daily'
import { WeekdayClicks } from './statistics/weekday'
import { Devices } from './statistics/devices'
import { UrlClicks } from './statistics/clicks'
import { syncFunctions } from './functions'
import { Tag } from './tag'
import { AsyncJob } from './job'

// One user can create many urls but each url can only be mapped to one user.
User.hasMany(Url, { as: 'Urls', foreignKey: { allowNull: false } })
Url.belongsTo(User, { foreignKey: { allowNull: false } })

// One user can run many jobs but each job can only be mapped to one user.
User.hasMany(AsyncJob, { as: 'AsyncJob', foreignKey: { allowNull: false } })
AsyncJob.belongsTo(User, { foreignKey: { allowNull: false } })

export const UrlTag = sequelize.define('url_tag', {}, { timestamps: true })

// An Url has many to many mapping to Tag
Url.belongsToMany(Tag, { through: UrlTag })
Tag.belongsToMany(Url, { through: UrlTag })

// A Url record can have many updates by many users
User.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(User, { foreignKey: { allowNull: false } })

// A Url record can have various rows of relevant statistics.
Url.hasMany(DailyClicks, { foreignKey: 'shortUrl', as: 'DailyClicks' })
Url.hasMany(WeekdayClicks, { foreignKey: 'shortUrl', as: 'WeekdayClicks' })
Url.hasOne(Devices, { foreignKey: 'shortUrl', as: 'DeviceClicks' })
Url.hasOne(UrlClicks, { foreignKey: 'shortUrl', as: 'UrlClicks' })
DailyClicks.belongsTo(Url, { foreignKey: 'shortUrl' })
WeekdayClicks.belongsTo(Url, { foreignKey: 'shortUrl' })
Devices.belongsTo(Url, { foreignKey: 'shortUrl' })
UrlClicks.belongsTo(Url, { foreignKey: 'shortUrl' })

/**
 * Initialise the database table.
 */
export default async () => {
  await sequelize.sync()
  await syncFunctions()
}
