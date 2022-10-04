// TODO: deduplicate code with client by moving to shared folder
import { customAlphabet } from 'nanoid/async'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Generate a random short URL.
 * The chance of a collision with a 36-character alphabet
 * of length 6 after 1 million URLs have been generated is
 * (1e6 / (36^6) = 0.000459, or one in 2176.
 */
export default function generateShortUrl(length: number) {
  const generate = customAlphabet(ALPHABET, length)
  return generate()
}
