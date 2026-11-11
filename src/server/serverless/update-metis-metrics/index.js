const { Client } = require('pg')

const METIS_API_URL = 'https://metis.atlas.gov.sg'
const PRODUCT_ID = 'cmfdk5fyq000c04l4hagggsky'

const METRIC_IDS = {
  totalUsers: 'rcbf774a323d1dc5394bc4f94',
  linksCreated: 'rcbf103755b640d116457b5be',
  linkVisits: 'rcbfa02ab6c9a60dc2375d7c0',
}

const DATABASE_URL_ENV_VARS = [
  'GO_DATABASE_URL',
  'HEALTH_DATABASE_URL',
  'EDU_DATABASE_URL',
]

// GoGovSG stores dates in SGT (sequelize timezone +08:00).
const SGT_OFFSET = '+08:00'
const MONTHS_PER_QUARTER = 3

// '2026Q3' -> { start: '2026-07-01', end: '2026-10-01' }, end exclusive.
function quarterRange(quarter) {
  const [year, q] = quarter.split('Q').map(Number)
  const toDate = (monthIndex) =>
    new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 10)

  return {
    start: toDate((q - 1) * MONTHS_PER_QUARTER),
    end: toDate(q * MONTHS_PER_QUARTER),
  }
}

async function queryDatabase(databaseUrl, { start, end }) {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const users = await client.query('SELECT COUNT(*)::int AS n FROM users')
    const links = await client.query(
      'SELECT COUNT(*)::int AS n FROM urls WHERE "createdAt" >= $1::timestamptz AND "createdAt" < $2::timestamptz',
      [`${start}T00:00:00${SGT_OFFSET}`, `${end}T00:00:00${SGT_OFFSET}`],
    )
    const visits = await client.query(
      'SELECT COALESCE(SUM(clicks), 0)::bigint AS n FROM daily_stats WHERE date >= $1 AND date < $2',
      [start, end],
    )

    return {
      totalUsers: users.rows[0].n,
      linksCreated: links.rows[0].n,
      linkVisits: Number(visits.rows[0].n),
    }
  } finally {
    await client.end()
  }
}

async function metis(path, options = {}) {
  const response = await fetch(
    `${METIS_API_URL}/api/products/${PRODUCT_ID}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${process.env.METIS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  )
  if (!response.ok) {
    throw Error(
      `Metis ${path} failed: ${response.status} ${await response.text()}`,
    )
  }

  return response
}

async function handler() {
  const { openQuarter } = await (await metis('/metrics')).json()
  if (!openQuarter.isEditable) {
    throw Error(`Metis quarter ${openQuarter.quarter} is not editable`)
  }

  const range = quarterRange(openQuarter.quarter)
  const perDatabase = await Promise.all(
    DATABASE_URL_ENV_VARS.map((name) =>
      queryDatabase(process.env[name], range),
    ),
  )

  const totals = { totalUsers: 0, linksCreated: 0, linkVisits: 0 }
  perDatabase.forEach((counts) => {
    Object.keys(totals).forEach((key) => {
      totals[key] += counts[key]
    })
  })
  console.log(`Metrics for ${openQuarter.quarter}`, totals)

  await metis('/metric-values', {
    method: 'PATCH',
    body: JSON.stringify({
      quarter: openQuarter.quarter,
      metricValues: Object.entries(totals).map(([key, value]) => ({
        productMetricId: METRIC_IDS[key],
        value,
      })),
    }),
  })

  return { quarter: openQuarter.quarter, ...totals }
}

module.exports = { handler, quarterRange }
