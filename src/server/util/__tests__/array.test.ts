import _ from 'lodash'
import arraysContainSame from '../array'

describe('arraysContainSame tests', () => {
  it('different array length should return false', () => {
    expect(arraysContainSame([1, 2, 3, 4], [1, 2, 3])).toStrictEqual(false)
  })
  it('different array element type should return false', () => {
    expect(arraysContainSame([1, 2, 3, 4], ['1', '2', '3', '4'])).toStrictEqual(
      false,
    )
  })
  it('two undefined arrays should return false', () => {
    expect(arraysContainSame(undefined, undefined)).toStrictEqual(false)
  })
  it('one undefined array and normal array return false', () => {
    expect(arraysContainSame(undefined, [1, 2, 3])).toStrictEqual(false)
  })
  it('two empty arrays should return true', () => {
    expect(arraysContainSame([], [])).toStrictEqual(true)
  })
  it('two numeric arrays should return true', () => {
    expect(arraysContainSame([1, 2, 3], [1, 2, 3])).toStrictEqual(true)
  })
  it('two numeric arrays with diff order should return true', () => {
    expect(arraysContainSame([1, 2, 3], [1, 3, 2])).toStrictEqual(true)
  })
  it('two numeric arrays with diff order should return true using isEqual', () => {
    expect(_.isEqual(_.sortBy([1, 2, 3]), _.sortBy([1, 3, 2]))).toStrictEqual(
      true,
    )
  })
})
