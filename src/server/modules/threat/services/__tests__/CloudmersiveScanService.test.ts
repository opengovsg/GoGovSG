import { CloudmersiveScanService } from '..'

const scanFile = jest.fn()
const scanWebsite = jest.fn()

const scanFileAdvanced = () => {}

const api = { scanFile, scanWebsite, scanFileAdvanced }
const file = { data: Buffer.from(''), name: '' }

describe('CloudmersiveScanService', () => {
  describe('without key', () => {
    const service = new CloudmersiveScanService('', api)

    it('does not trigger file scans', async () => {
      await expect(service.hasVirus(file)).resolves.toBeFalsy()
      expect(scanFile).not.toHaveBeenCalled()
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
  })
})
