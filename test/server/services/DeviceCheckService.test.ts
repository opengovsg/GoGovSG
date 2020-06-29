import { DeviceCheckService } from '../../../src/server/services/DeviceCheckService'

/**
 * Unit tests for DeviceCheckService.
 */
describe('DeviceCheckService tests', () => {
  describe('getDeviceType tests', () => {
    const service = new DeviceCheckService()
    test('should correctly identify facebook bots', () => {
      expect(service.getDeviceType('facebookexternalhit/1.1')).toStrictEqual(
        'others',
      )
      expect(
        service.getDeviceType(
          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        ),
      ).toStrictEqual('others')
    })

    describe('I am not a bot', () => {
      test('example mac user agent', () => {
        expect(
          service.getDeviceType(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
          ),
        ).toStrictEqual('desktop')
      })

      test('example mobile safari user agent', () => {
        expect(
          service.getDeviceType(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
          ),
        ).toStrictEqual('mobile')
      })
    })
  })
})
