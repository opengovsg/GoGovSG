/**
 * Formats a number to use k, m, etc.
 * E.g 100010 becomes 100k.
 * @param  {} num The number to format.
 */
export function numberUnitFormatter(num) {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'm' },
    { value: 1e9, symbol: 'b' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i -= 1) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(0).replace(rx, '$1') + si[i].symbol
}

export default new Intl.NumberFormat()
