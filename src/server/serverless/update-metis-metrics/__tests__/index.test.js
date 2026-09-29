const { handler, quarterRange } = require('../index')

const COUNTS_PER_DATABASE = {
  users: 10,
  urls: 5,
  daily_stats: '100',
}

jest.mock('pg', () => ({
  Client: jest.fn(() => ({
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(async (sql) => {
      const table = Object.keys(COUNTS_PER_DATABASE).find((name) =>
        sql.includes(`FROM ${name}`),
      )

      return { rows: [{ n: COUNTS_PER_DATABASE[table] }] }
    }),
  })),
}))

describe('quarterRange', () => {
  it('returns first day of the quarter to first day of the next, end exclusive', () => {
    expect(quarterRange('2026Q1')).toEqual({
      start: '2026-01-01',
      end: '2026-04-01',
    })
    expect(quarterRange('2026Q3')).toEqual({
      start: '2026-07-01',
      end: '2026-10-01',
    })
  })

  it('rolls Q4 over into the next year', () => {
    expect(quarterRange('2026Q4')).toEqual({
      start: '2026-10-01',
      end: '2027-01-01',
    })
  })
})

describe('handler', () => {
  const OPEN_QUARTER = '2026Q3'
  let fetchMock

  function metisResponse(body = {}) {
    return { ok: true, json: async () => body, text: async () => '' }
  }

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock
  })

  it('sums counts across the three databases and writes them to the open quarter', async () => {
    fetchMock
      .mockResolvedValueOnce(
        metisResponse({
          openQuarter: { quarter: OPEN_QUARTER, isEditable: true },
        }),
      )
      .mockResolvedValueOnce(metisResponse())

    const result = await handler()

    expect(result).toEqual({
      quarter: OPEN_QUARTER,
      totalUsers: 30,
      linksCreated: 15,
      linkVisits: 300,
    })

    const [url, options] = fetchMock.mock.calls[1]
    expect(url).toMatch(/\/metric-values$/)
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual({
      quarter: OPEN_QUARTER,
      metricValues: [
        { productMetricId: 'rcbf774a323d1dc5394bc4f94', value: 30 },
        { productMetricId: 'rcbf103755b640d116457b5be', value: 15 },
        { productMetricId: 'rcbfa02ab6c9a60dc2375d7c0', value: 300 },
      ],
    })
  })

  it('does not write when the open quarter is not editable', async () => {
    fetchMock.mockResolvedValueOnce(
      metisResponse({
        openQuarter: { quarter: OPEN_QUARTER, isEditable: false },
      }),
    )

    await expect(handler()).rejects.toThrow('not editable')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
