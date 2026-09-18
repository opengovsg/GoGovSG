import { sequelize } from '../util/sequelize.js'
import { Url, UrlHistory } from './url.js'
import { User } from './user.js'
import { DailyClicks } from './statistics/daily.js'
import { WeekdayClicks } from './statistics/weekday.js'
import { Devices } from './statistics/devices.js'
import { UrlClicks } from './statistics/clicks.js'
import { syncFunctions } from './functions.js'
import { Tag } from './tag.js'
import { Job, JobItem } from './job.js'
import { DEV_ENV } from '../config.js'

// One user can create many urls but each url can only be mapped to one user.
User.hasMany(Url, { as: 'Urls', foreignKey: { allowNull: true } })
Url.belongsTo(User, { foreignKey: { allowNull: true } })

// One user can run many jobs but each job can only be mapped to one user.
User.hasMany(Job, { as: 'Job', foreignKey: { allowNull: false } })
Job.belongsTo(User, { foreignKey: { allowNull: false } })

// One job can run many jobItems but each jobItem can only be mapped to one job.
Job.hasMany(JobItem, { as: 'JobItem', foreignKey: { allowNull: false } })
JobItem.belongsTo(Job, { foreignKey: { allowNull: false } })

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
  if (DEV_ENV) {
    await sequelize.sync({ alter: true })
    await syncFunctions()
  }
}
