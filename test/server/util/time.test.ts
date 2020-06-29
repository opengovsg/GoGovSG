import * as time from '../../../src/server/util/time'

describe('time util tests', () => {
  beforeAll(() => {
    // Monday June 29 2020 12:41:25 SGT.
    jest.spyOn(Date, 'now').mockReturnValue(1593405685247)
  })
  afterAll(() => {
    jest.spyOn(Date, 'now').mockRestore()
  })

  test('getLocalDayGroup returns correct local dates', () => {
    expect(time.getLocalDayGroup()).toBe('2020-06-29')
    expect(time.getLocalDayGroup(0)).toBe('2020-06-29')
    expect(time.getLocalDayGroup(-1)).toBe('2020-06-28')
    expect(time.getLocalDayGroup(-6)).toBe('2020-06-23')
  })

  test('getLocalWeekday returns correct local weekdays', () => {
    expect(time.getLocalWeekday()).toBe(1)
    expect(time.getLocalWeekday(0)).toBe(1)
    expect(time.getLocalWeekday(-1)).toBe(0)
    expect(time.getLocalWeekday(-6)).toBe(2)
  })

  test('getLocalTime returns correct local information', () => {
    expect(time.getLocalTime()).toStrictEqual({
      weekday: 1,
      hours: 12,
      date: '2020-06-29',
    })
    expect(time.getLocalTime(0)).toStrictEqual({
      weekday: 1,
      hours: 12,
      date: '2020-06-29',
    })
    expect(time.getLocalTime(-1)).toStrictEqual({
      weekday: 0,
      hours: 12,
      date: '2020-06-28',
    })
    expect(time.getLocalTime(-6)).toStrictEqual({
      weekday: 2,
      hours: 12,
      date: '2020-06-23',
    })
  })
})
