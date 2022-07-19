import { datadogRum } from '@datadog/browser-rum'

const initMonitoringIfTokensPresent = () => {
  console.log('before dataDogRum init')
  if (
    !process.env.REACT_APP_DATADOG_APPLICATION_ID ||
    !process.env.REACT_APP_DATADOG_CLIENT_TOKEN
  ) {
    console.log('dataDogRum init failed, missing env vars')
    return
  }
  datadogRum.init({
    applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID as string,
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN as string,
    site: 'datadoghq.com',
    service: 'gogovsg',

    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  })
  console.log('after dataDogRum init')
  datadogRum.startSessionReplayRecording()
}

export default initMonitoringIfTokensPresent
