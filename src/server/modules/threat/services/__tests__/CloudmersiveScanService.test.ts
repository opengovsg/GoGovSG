import { CloudmersiveScanService } from '..'

const scanFile = () => {}
const scanWebsite = jest.fn()
const scanFileAdvanced = jest.fn()

const api = { scanFile, scanWebsite, scanFileAdvanced }
const file = { data: Buffer.from(''), name: '' }
const url = 'https://google.com'

describe('CloudmersiveScanService', () => {
  describe('without key', () => {
    const service = new CloudmersiveScanService('', api)

    it('does not trigger file scans', async () => {
      await expect(service.scanFile(file)).resolves.toEqual({
        hasVirus: false,
        isPasswordProtected: false,
      })
      expect(scanFileAdvanced).not.toHaveBeenCalled()
    })

    it('does not trigger url scans', async () => {
      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(scanWebsite).not.toHaveBeenCalled()
    })
  })

  describe('with key', () => {
    const service = new CloudmersiveScanService('key', api)

    describe('hasVirus', () => {
      beforeEach(() => scanFileAdvanced.mockClear())
      it('returns false on clean file', async () => {
        scanFileAdvanced.mockImplementation((_ignored, _ignored2, callback) =>
          callback(null, {
            FoundViruses: null,
            ContainsPasswordProtectedFile: false,
          }),
        )
        await expect(service.scanFile(file)).resolves.toEqual({
          hasVirus: false,
          isPasswordProtected: false,
        })
        expect(scanFileAdvanced).toHaveBeenCalled()
      })

      it('returns true on dirty file', async () => {
        scanFileAdvanced.mockImplementation((_ignored, _ignored2, callback) =>
          callback(null, {
            FoundViruses: [
              { FileName: 'stream', VirusName: ' Eicar-Signature' },
            ],
          }),
        )
        await expect(service.scanFile(file)).resolves.toBeTruthy()
        expect(scanFileAdvanced).toHaveBeenCalled()
      })

      it('throws on scan error', async () => {
        const error = new Error()
        scanFileAdvanced.mockImplementation((_ignored, _ignored2, callback) =>
          callback(error, null),
        )
        await expect(service.scanFile(file)).rejects.toStrictEqual(error)
        expect(scanFileAdvanced).toHaveBeenCalled()
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
