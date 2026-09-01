import {
  urlEditSchema,
  urlSchema,
} from '../../../../src/server/api/external-v1/validators'

describe('external-v1 validators', () => {
  const baseUserId = { userId: 1 }

  it('urlSchema accepts optional tags, description, and contactEmail', () => {
    const { error } = urlSchema.validate({
      ...baseUserId,
      longUrl: 'https://example.com',
      tags: ['campaign-a', '2026'],
      description: 'Landing page',
      contactEmail: 'person@sub.test.sg',
    })
    expect(error).toBeUndefined()
  })

  it('urlEditSchema rejects non-ASCII description', () => {
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
