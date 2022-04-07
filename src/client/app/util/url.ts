import { customAlphabet } from 'nanoid/async'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const LENGTH = 6
const generate = customAlphabet(ALPHABET, LENGTH)

/**
 * Generate a random short URL.
 * The chance of a collision with a 36-character alphabet
 * of length 6 after 1 million URLs have been generated is
 * (1e6 / (36^6) = 0.000459, or one in 2176.
 */
export async function generateShortUrl() {
  return generate()
}

/**
 * Strips http or https from url string.
 * @param url The url to strip the protocol from.
 */
export function removeHttpsProtocol(url: string) {
  return url.replace(/^(https?):\/\//, '')
}
