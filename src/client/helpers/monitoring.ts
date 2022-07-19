import { datadogRum } from '@datadog/browser-rum'

if (
  !process.env.DATADOG_APPLICATION_ID ||
  !process.env.REACT_APP_DATADOG_CLIENT_TOKEN
) {
  return
}

datadogRum.init({
  applicationId: process.env.DATADOG_APPLICATION_ID,
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'gogovsg',

  // Specify a version number to identify the deployed version of your application in Datadog
  // version: '1.0.0',
  sampleRate: 100,
  premiumSampleRate: 100,
  trackInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
})

datadogRum.startSessionReplayRecording()
