import { StatsD } from 'hot-shots'

const dogstatsd = new StatsD({
  prefix: 'go.',
})

export default dogstatsd
