import { datadogRum } from '@datadog/browser-rum'
import { DD_ENV, DD_SERVICE } from './helpers'

const initMonitoring = () => {
  datadogRum.init({
    applicationId: '898ea704-7347-45dc-b40c-bf85359e062e',
    clientToken: 'pub40fb07aa43d3f6f034d8fcc7f1df867b',
    site: 'datadoghq.com',
    service: DD_SERVICE,
    env: DD_ENV,
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  })
  datadogRum.startSessionReplayRecording()
}

export default initMonitoring
