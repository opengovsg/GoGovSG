import { urlEditSchema, urlSchema } from '../../../../src/server/api/external-v1/validators'

describe('external-v1 validators', () => {
  const baseUserId = { userId: 1 }

  describe('urlSchema', () => {
    it('accepts optional tags, description, and contactEmail', () => {
      const { error } = urlSchema.validate({
        ...baseUserId,
        longUrl: 'https://example.com',
        tags: ['campaign-a', '2026'],
        description: 'Landing page',
        contactEmail: 'person@sub.test.sg',
      })
      expect(error).toBeUndefined()
    })

    it('rejects invalid tags', () => {
      const { error } = urlSchema.validate({
        ...baseUserId,
        longUrl: 'https://example.com',
        tags: ['tag-a', 'tag-a'],
      })
      expect(error?.message).toBe('"tags[1]" contains a duplicate value')
    })

    it('rejects invalid contactEmail', () => {
      const { error } = urlSchema.validate({
        ...baseUserId,
        longUrl: 'https://example.com',
        contactEmail: 'not-gov@example.com',
      })
      expect(error?.message).toBe('Not a valid gov email or null')
    })
  })

  describe('urlEditSchema', () => {
    it('accepts optional tags, description, and contactEmail', () => {
      const { error } = urlEditSchema.validate({
        ...baseUserId,
        shortUrl: 'my-link',
        tags: ['campaign-a'],
        description: '',
        contactEmail: null,
      })
      expect(error).toBeUndefined()
    })

    it('rejects non-ASCII description', () => {
      const { error } = urlEditSchema.validate({
        ...baseUserId,
        shortUrl: 'my-link',
        description: 'café',
      })
      expect(error?.message).toBe(
        'Description must only contain ASCII characters.',
      )
    })
  })
})
