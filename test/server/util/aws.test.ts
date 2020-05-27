import { container } from '../../../src/server/util/inversify'
import { S3Interface, S3ServerSide } from '../../../src/server/util/aws'
import { DependencyIds } from '../../../src/server/constants'

describe('S3 link validator', () => {
  afterEach(() => {
    container.unbindAll()
  })
  beforeEach(() => {
    container.bind<S3Interface>(DependencyIds.s3).to(S3ServerSide)
  })
  it('should return correct file link when provided with a short url', () => {
    const shortUrl = 'test'
    const validLink = `https://file-staging.go.gov.sg/${shortUrl}`
    const { buildFileLongUrl } = container.get<S3Interface>(DependencyIds.s3)
    expect(buildFileLongUrl(shortUrl)).toBe(validLink)
  })
})
