import { StatsD } from 'hot-shots'
import { DEV_ENV } from '../config'

const dogstatsd = new StatsD({
  prefix: 'go.',
  mock: DEV_ENV,
})

export default dogstatsd
