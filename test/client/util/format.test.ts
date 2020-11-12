import {
  THRESHOLD_VAL,
  numberUnitFormatter,
} from '../../../src/client/app/util/format'

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

describe('thousands are not formatted', () => {
  test('a thousand is 1000', () => {
    const valueToTest = 1_000
    expect(numberUnitFormatter(valueToTest)).toBe('1,000')
  })
  test('thousands does not round up to millions', () => {
    const valueToTest = 999_999
    expect(numberUnitFormatter(valueToTest)).toBe('999,999')
  })
})

describe('millions below threshold are not formatted', () => {
  test('a million is 1,000,000', () => {
    const valueToTest = 1_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('1,000,000')
  })
  test('threshold limit is not formatted', () => {
    const valueToTest = THRESHOLD_VAL
    expect(numberUnitFormatter(valueToTest)).toBe('9,999,999')
  })
})

describe('millions above threshold are formatted with m', () => {
  test('value after threshold limit is formatted', () => {
    const valueToTest = THRESHOLD_VAL + 1
    expect(numberUnitFormatter(valueToTest)).toBe('10m')
  })
  test('millions does not round up to billions', () => {
    const valueToTest = 999_999_999
    expect(numberUnitFormatter(valueToTest)).toBe('999m')
  })
})

describe('billions are formatted with b', () => {
  test('a billions is 1b', () => {
    const valueToTest = 1_000_000_000
    expect(numberUnitFormatter(valueToTest)).toBe('1b')
  })
  test('billions does not round up', () => {
    const valueToTest = 1_999_999_999
    expect(numberUnitFormatter(valueToTest)).toBe('1b')
  })
  test('billions does not round up to trillions', () => {
    const valueToTest = 999_999_999_999
    expect(numberUnitFormatter(valueToTest)).toBe('999b')
  })
})
