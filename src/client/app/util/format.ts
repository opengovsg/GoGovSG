import sanitizeHtml from 'sanitize-html'

// Threshold value for click count before applying compact notations.
export const THRESHOLD_VAL = 9_999_999

/**
 * Takes in a number and format in into a compact form without rounding.
 * This method takes reference to a constant threshold value, and only compact
 * values that exceed this threshold.
 *
 * @param numberToFormat Number to format.
 * @returns The formatted string with the compact notations.
 */
export function numberUnitFormatter(numberToFormat: number): string {
  const getNotation = () => {
    if (numberToFormat >= 1_000_000_000_000) return 't'
    if (numberToFormat >= 1_000_000_000) return 'b'
    if (numberToFormat >= 1_000_000) return 'm'
    return ''
  }
  if (numberToFormat <= THRESHOLD_VAL) {
    const numberFormatter = new Intl.NumberFormat('en-US')
    return numberFormatter.format(numberToFormat)
  }
  let compactNumber = numberToFormat
  while (compactNumber >= 1_000) {
    compactNumber = Math.floor(compactNumber / 1_000)
  }
  return compactNumber + getNotation()
}

/**
 * Takes in a number and format in into a compact form without rounding.
 *
 * @param numberToFormat Number to format.
 * @returns The formatted string with the compact notations.
 */
export function compactNumberFormatter(numberToFormat: number): string {
  const getNotation = () => {
    if (numberToFormat >= 1_000_000_000_000) return 't'
    if (numberToFormat >= 1_000_000_000) return 'b'
    if (numberToFormat >= 1_000_000) return 'm'
    if (numberToFormat >= 1_000) return 'k'
    return ''
  }
  let compactNumber = numberToFormat
  while (compactNumber >= 1_000) {
    compactNumber = Math.floor(compactNumber / 1_000)
  }
  return compactNumber + getNotation()
}

/**
 * Takes in numerical bytes and apply compact notations to it.
 *
 * @param bytes The bytes for format.
 */
export function formatBytes(bytes: number) {
  if (bytes === 0) return '0b'

  const k = 1024
  const sizes = ['b', 'kb', 'mb', 'gb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(1))}${sizes[i]}`
}

export function hmtlSanitizer(dirtyHtmlString: string) {
  return sanitizeHtml(dirtyHtmlString, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'style'],
    },
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        color: [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        ],
        'text-decoration': [/^underline$/],
      },
    },
  })
}

export default new Intl.NumberFormat()
