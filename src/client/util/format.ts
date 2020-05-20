/**
 * Takes in a number and format in into a compact form, with 'k', 'm', or 'b'.
 *
 * @param numberToFormat Number to format.
 * @returns The formatted string with the lowercase compact notations.
 */
export function numberUnitFormatter(numberToFormat: number): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    // @ts-ignore
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 0,
  })
  return formatter.format(numberToFormat).toLowerCase()
}

export default new Intl.NumberFormat()
