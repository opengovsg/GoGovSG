import { GrowthBookClient } from '@growthbook/growthbook'

jest.mock('@growthbook/growthbook')

jest.mock('../../../shared/util/asset-variant', () => 'gov')

const mockConfigState = {
  growthbookClientKey: undefined as string | undefined,
  growthbookApiHost: 'https://cdn.growthbook.io',
}

jest.mock('../../config', () => ({
  get growthbookClientKey() {
    return mockConfigState.growthbookClientKey
  },
  get growthbookApiHost() {
    return mockConfigState.growthbookApiHost
  },
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}))

import GrowthBookOperatorCopyService from '../GrowthBookOperatorCopyService'

const mockInit = jest.fn()
const mockGetFeatureValue = jest.fn()

const MockGrowthBookClient = GrowthBookClient as jest.MockedClass<
  typeof GrowthBookClient
>

describe('GrowthBookOperatorCopyService', () => {
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
    const service = new GrowthBookOperatorCopyService()

    await service.init()

    expect(MockGrowthBookClient).not.toHaveBeenCalled()
    expect(service.getLoginMessage()).toBe('')
    expect(service.getUserMessage()).toBe('')
    expect(service.getUserAnnouncement()).toBeNull()
  })

  it('initialises the client with polling and evaluates variant keys', async () => {
    mockConfigState.growthbookClientKey = 'sdk-test'
    mockGetFeatureValue.mockImplementation((key, fallback) => {
      if (key === 'login_message_gov') return 'OTP delay notice'
      if (key === 'user_message_gov') return 'Dashboard banner'
      if (key === 'announcement_gov') {
        return { title: 'Title', buttonText: 'Go' }
      }
      return fallback
    })

    const service = new GrowthBookOperatorCopyService()

    await service.init()

    expect(MockGrowthBookClient).toHaveBeenCalledWith({
      apiHost: 'https://cdn.growthbook.io',
      clientKey: 'sdk-test',
    })
    expect(mockInit).toHaveBeenCalledWith({
      timeout: 3000,
    })
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

    const service = new GrowthBookOperatorCopyService()

    await service.init()

    expect(service.getLoginMessage()).toBe('')
    expect(service.getUserMessage()).toBe('')
    expect(service.getUserAnnouncement()).toBeNull()
  })

  it('returns cached values from the client after a successful init', async () => {
    mockConfigState.growthbookClientKey = 'sdk-test'
    mockGetFeatureValue.mockImplementation((key, fallback) => {
      if (key === 'login_message_gov') return 'Still visible'
      return fallback
    })

    const service = new GrowthBookOperatorCopyService()

    await service.init()
    expect(service.getLoginMessage()).toBe('Still visible')
    expect(service.getLoginMessage()).toBe('Still visible')
  })
})
