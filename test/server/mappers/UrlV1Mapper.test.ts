import { UrlV1Mapper } from '../../../src/server/mappers/UrlV1Mapper'
import {
  StorableUrlSource,
  StorableUrlState,
} from '../../../src/server/repositories/enums'
import { StorableUrl } from '../../../src/server/repositories/types'

describe('url v1 mapper', () => {
  const urlV1Mapper = new UrlV1Mapper()
  it('should map only specific fields from original url to mapped url', () => {
    const storableUrl: StorableUrl = {
      shortUrl: 'test-short-url',
      longUrl: 'https://example.com',
      state: StorableUrlState.Active,
      source: StorableUrlSource.Api,
      clicks: 10,
      createdAt: '2022-01-02T01:23:45.678Z',
      updatedAt: '2022-01-02T01:23:45.678Z',
      isFile: false,
      tags: ['1', 'abc', 'foo-bar'],
      tagStrings: '1;abc;foo-bar',
      contactEmail: 'bar@open.gov.sg',
      description: 'this-is-a-description',
    }
    const urlV1DTO = urlV1Mapper.persistenceToDto(storableUrl)
    expect(urlV1DTO).toEqual({
      shortUrl: storableUrl.shortUrl,
      longUrl: storableUrl.longUrl,
      state: storableUrl.state,
      clicks: storableUrl.clicks,
      createdAt: storableUrl.createdAt,
      updatedAt: storableUrl.updatedAt,
    })
  })
})
