import { CloudmersiveScanService } from '../../../src/server/services/CloudmersiveScanService'

const scanFile = jest.fn()
const scanWebsite = jest.fn()

const scanFileAdvanced = () => {}

const api = { scanFile, scanWebsite, scanFileAdvanced }
const file = { data: Buffer.from(''), name: '' }
const url = 'https://google.com'

describe('CloudmersiveScanService', () => {
  describe('without key', () => {
    const service = new CloudmersiveScanService('', api)

    it('does not trigger file scans', async () => {
      await expect(service.hasVirus(file)).resolves.toBeFalsy()
      expect(scanFile).not.toHaveBeenCalled()
    })

    it('does not trigger url scans', async () => {
      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(scanWebsite).not.toHaveBeenCalled()
    })
  })

  describe('with key', () => {
    const service = new CloudmersiveScanService('key', api)

    describe('hasVirus', () => {
      beforeEach(() => scanFile.mockClear())
      it('returns false on clean file', async () => {
        scanFile.mockImplementation((_ignored, callback) =>
          callback(null, { CleanResult: true }),
        )
        await expect(service.hasVirus(file)).resolves.toBeFalsy()
        expect(scanFile).toHaveBeenCalled()
      })

      it('returns true on dirty file', async () => {
        scanFile.mockImplementation((_ignored, callback) =>
          callback(null, { CleanResult: false }),
        )
        await expect(service.hasVirus(file)).resolves.toBeTruthy()
        expect(scanFile).toHaveBeenCalled()
      })

      it('throws on scan error', async () => {
        const error = new Error()
        scanFile.mockImplementation((_ignored, callback) =>
          callback(error, null),
        )
        await expect(service.hasVirus(file)).rejects.toStrictEqual(error)
        expect(scanFile).toHaveBeenCalled()
      })
    })

    describe('isThreat', () => {
      beforeEach(() => scanWebsite.mockClear())
      it('returns false on clean URL', async () => {
        scanWebsite.mockImplementation((_ignored, callback) =>
          callback(null, { CleanResult: true }),
        )
        await expect(service.isThreat(url)).resolves.toBeFalsy()
        expect(scanWebsite).toHaveBeenCalled()
      })

      // Cloudmersive is known to be very sensitive to URLs,
      // so we return false for all scans. This has been
      // superseded by Google Safe Browsing, but we keep this
      // around as a reference
      it('returns false even on dirty URL', async () => {
        scanWebsite.mockImplementation((_ignored, callback) =>
          callback(null, { CleanResult: false }),
        )
        await expect(service.isThreat(url)).resolves.toBeFalsy()
        expect(scanWebsite).toHaveBeenCalled()
      })

      it('throws on scan error', async () => {
        const error = new Error()
        scanWebsite.mockImplementation((_ignored, callback) =>
          callback(error, null),
        )
        await expect(service.isThreat(url)).rejects.toStrictEqual(error)
        expect(scanWebsite).toHaveBeenCalled()
      })
    })
  })
})
