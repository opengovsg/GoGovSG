import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { UrlType } from '../../../src/server/models/url'

describe('url mapper', () => {
  it('url contains empty tags', () => {
    const urlMapper = new UrlMapper()
    const storableUrl = urlMapper.persistenceToDto({
      UrlClicks: { clicks: 0 },
      tagStrings: '',
    } as UrlType)
    expect(storableUrl.tags).toHaveLength(0)
  })
  it('url contains 2 tags', () => {
    const urlMapper = new UrlMapper()
    const storableUrl = urlMapper.persistenceToDto({
      UrlClicks: { clicks: 0 },
      tagStrings: 'tag1;tag2',
    } as UrlType)
    expect(storableUrl.tags).toHaveLength(2)
  })
})
