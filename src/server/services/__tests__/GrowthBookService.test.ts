import { GrowthBookClient } from '@growthbook/growthbook'

import { GrowthBookService } from '../GrowthBookService'

jest.mock('@growthbook/growthbook')
jest.mock('../../../shared/util/asset-variant', () => 'gov')

const mockConfigState = {
  growthbookClientKey: undefined as string | undefined,
}

jest.mock('../../config', () => ({
  get growthbookClientKey() {
    return mockConfigState.growthbookClientKey
  },
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}))

const mockInit = jest.fn()
const mockGetFeatureValue = jest.fn()
const MockGrowthBookClient = GrowthBookClient as jest.MockedClass<
  typeof GrowthBookClient
>

describe('GrowthBookService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockConfigState.growthbookClientKey = undefined
    mockInit.mockResolvedValue({ success: true, source: 'network' })
    mockGetFeatureValue.mockImplementation((_key, fallback) => fallback)
    MockGrowthBookClient.mockImplementation(
      () =>
        ({
          init: mockInit,
          getFeatureValue: mockGetFeatureValue,
          refreshFeatures: jest.fn().mockResolvedValue(undefined),
        }) as unknown as GrowthBookClient,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns empty copy when GROWTHBOOK_CLIENT_KEY is unset', async () => {
    const service = new GrowthBookService()

    await service.init()

    expect(MockGrowthBookClient).not.toHaveBeenCalled()
    expect(service.getLoginMessage()).toBe('')
    expect(service.getUserMessage()).toBe('')
    expect(service.getUserAnnouncement()).toBeNull()
  })

  it('evaluates variant keys from GrowthBook', async () => {
    mockConfigState.growthbookClientKey = 'sdk-test'
    mockGetFeatureValue.mockImplementation((key, fallback) => {
      if (key === 'login_message_gov') return 'OTP delay notice'
      if (key === 'user_message_gov') return 'Dashboard banner'
      if (key === 'announcement_gov') {
        return { title: 'Title', buttonText: 'Go' }
      }
      return fallback
    })

    const service = new GrowthBookService()
    await service.init()

    expect(mockInit).toHaveBeenCalledWith({ timeout: 3000 })
    expect(service.getLoginMessage()).toBe('OTP delay notice')
    expect(service.getUserMessage()).toBe('Dashboard banner')
    expect(service.getUserAnnouncement()).toEqual({
      title: 'Title',
      buttonText: 'Go',
    })
  })

  it('serves empty copy when init fails on first fetch', async () => {
    mockConfigState.growthbookClientKey = 'sdk-test'
    mockInit.mockResolvedValue({ success: false, source: 'timeout' })

    const service = new GrowthBookService()
    await service.init()

    expect(service.getLoginMessage()).toBe('')
    expect(service.getUserAnnouncement()).toBeNull()
  })
})
