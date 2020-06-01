import {
  addFileExtension,
  getFileExtension,
} from '../../../src/server/util/fileFormat'

describe('getFileExtension tests', () => {
  test('file with many dots', () => {
    expect(getFileExtension('file.with.many.dots')).toBe('dots')
  })
  test('normal file', () => {
    expect(getFileExtension('file.csv')).toBe('csv')
  })
  test('no extensions', () => {
    expect(getFileExtension('asdasdv')).toBe('')
  })
})

describe('addFileExtension tests', () => {
  test('file with many dots', () => {
    expect(addFileExtension('file.with.many.dots', 't')).toBe(
      'file.with.many.dots.t',
    )
  })
  test('normal file', () => {
    expect(addFileExtension('file', 'csv')).toBe('file.csv')
  })
  test('no extensions', () => {
    expect(addFileExtension('asdasdv', '')).toBe('asdasdv')
  })
})
