/**
 * Takes in a number and format in into a compact form without rounding.
 *
 * @param numberToFormat Number to format.
 * @returns The formatted string with the compact notations.
 */
export function numberUnitFormatter(numberToFormat: number): string {
  const getNotation = () => {
    if (numberToFormat >= 1_000_000_000_000) return 't'
    if (numberToFormat >= 1_000_000_000) return 'b'
    if (numberToFormat >= 1_000_000) return 'm'
    if (numberToFormat >= 1_000) return 'k'
    return ''
  }
  let compactNumber = numberToFormat
  while (compactNumber >= 1000) compactNumber = Math.floor(compactNumber / 1000)
  return compactNumber + getNotation()
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0b'

  const k = 1024
  const sizes = ['b', 'kb', 'mb', 'gb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(1))}${sizes[i]}`
}

export default new Intl.NumberFormat()
