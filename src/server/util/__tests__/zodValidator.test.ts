import { z } from 'zod'

import {
  formatZodValidationError,
  formatZodValidationMessage,
} from '../zodValidator.js'
import { longUrlSchema } from '../../api/shared/schemas.js'

describe('formatZodValidationError', () => {
  it('formats missing required fields like Joi', () => {
    const schema = z.object({
      longUrl: z.string(),
      email: z.string(),
    })
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodValidationError(result.error)).toBe(
        'ValidationError: "longUrl" is required. "email" is required',
      )
    }
  })

  it('formats custom validation messages', () => {
    const result = longUrlSchema.safeParse('http://example.com')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodValidationError(result.error)).toBe(
        'ValidationError: Only HTTPS URLs are allowed.',
      )
    }
  })

  it('formats enum validation messages', () => {
    const schema = z.object({
      state: z.enum(['ACTIVE', 'INACTIVE']),
    })
    const result = schema.safeParse({ state: 'INVALID' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodValidationError(result.error)).toBe(
        'ValidationError: "state" must be one of [ACTIVE, INACTIVE]',
      )
    }
  })
})

describe('formatZodValidationMessage', () => {
  it('omits the ValidationError prefix for manual validation', () => {
    const schema = z.object({
      searchText: z.string().min(3),
    })
    const result = schema.safeParse({ searchText: 'ab' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const message = formatZodValidationMessage(result.error)
      expect(message).not.toMatch(/^ValidationError:/)
      expect(message.length).toBeGreaterThan(0)
    }
  })
})
