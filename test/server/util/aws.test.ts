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
  it('should return true when provided with a valid link', () => {
    const shortUrl = 'test'
    const validLink = `https://file-staging.go.gov.sg/${shortUrl}`
    const { isValidS3Shortlink } = container.get<S3Interface>(DependencyIds.s3)
    expect(isValidS3Shortlink(validLink, shortUrl)).toBe(true)
  })
  it('should return false when given correct bucket link but incorrect shortlink', () => {
    const shortUrl = 'test'
    const invalidLink = `https://file-staging.go.gov.sg/${shortUrl}1`
    const { isValidS3Shortlink } = container.get<S3Interface>(DependencyIds.s3)
    expect(isValidS3Shortlink(invalidLink, shortUrl)).toBe(false)
  })
  it('should return false when given correct shortlink but incorrect bucket link', () => {
    const shortUrl = 'test'
    const invalidLink = `https://file-staging-incorrect.go.gov.sg/${shortUrl}`
    const { isValidS3Shortlink } = container.get<S3Interface>(DependencyIds.s3)
    expect(isValidS3Shortlink(invalidLink, shortUrl)).toBe(false)
  })
})
