const { quarterRange } = require('../index')

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
