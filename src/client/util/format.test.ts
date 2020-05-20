import { numberUnitFormatter } from './format'

describe('ones, tens, hundreds are not formatted', () => {
  test('one is 1', () => {
    const valueToTest = 1
    expect(numberUnitFormatter(valueToTest)).toBe('1')
  })
  test('ten is 10', () => {
    const valueToTest = 10
    expect(numberUnitFormatter(valueToTest)).toBe('10')
  })
  test('hundred is 100', () => {
    const valueToTest = 100
    expect(numberUnitFormatter(valueToTest)).toBe('100')
  })
  test('hundreds does not round up to thousands', () => {
    const valueToTest = 999
    expect(numberUnitFormatter(valueToTest)).toBe('999')
  })
})

describe('thousands are formatted with k', () => {
  test('a thousand is 1k', () => {
    const valueToTest = 1_000
    expect(numberUnitFormatter(valueToTest)).toBe('1k')
  })
  test('thousands does not round up', () => {
    const valueToTest = 1_499
    expect(numberUnitFormatter(valueToTest)).toBe('1k')
  })
  test('thousands rounds up', () => {
    const valueToTest = 1_500
    expect(numberUnitFormatter(valueToTest)).toBe('2k')
  })
  test('thousands does not round up to millions', () => {
    const valueToTest = 999_499
    expect(numberUnitFormatter(valueToTest)).toBe('999k')
  })
  test('thousands rounds up to millions', () => {
    const valueToTest = 999_500
    expect(numberUnitFormatter(valueToTest)).toBe('1m')
  })
})

describe('millions are formatted with m', () => {
  test('a million is 1m', () => {
    const valueToTest = 1_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('1m')
  })
  test('millions does not round up', () => {
    const valueToTest = 1_499_999
    expect(numberUnitFormatter(valueToTest)).toBe('1m')
  })
  test('millions rounds up', () => {
    const valueToTest = 1_500_000
    expect(numberUnitFormatter(valueToTest)).toBe('2m')
  })
  test('millions does not round up to billions', () => {
    const valueToTest = 999_499_999
    expect(numberUnitFormatter(valueToTest)).toBe('999m')
  })
  test('millions rounds up to billions', () => {
    const valueToTest = 999_500_000
    expect(numberUnitFormatter(valueToTest)).toBe('1b')
  })
})

describe('billions are formatted with b', () => {
  test('a billions is 1b', () => {
    const valueToTest = 1_000_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('1b')
  })
  test('billions does not round up', () => {
    const valueToTest = 1_499_999_999
    expect(numberUnitFormatter(valueToTest)).toBe('1b')
  })
  test('billions rounds up', () => {
    const valueToTest = 1_500_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('2b')
  })
  test('billions does not round up to trillions', () => {
    const valueToTest = 999_499_999_999
    expect(numberUnitFormatter(valueToTest)).toBe('999b')
  })
  test('billions rounds up to trillions', () => {
    const valueToTest = 999_500_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('1t')
  })
})
