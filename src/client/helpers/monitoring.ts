import { datadogRum } from '@datadog/browser-rum'

const initMonitoringIfTokensPresent = () => {
  console.log('before dataDogRum init')
  // if (
  //   !process.env.REACT_APP_DATADOG_APPLICATION_ID ||
  //   !process.env.REACT_APP_DATADOG_CLIENT_TOKEN
  // ) {
  //   console.log('dataDogRum init failed, missing env vars')
  //   return
  // }
  datadogRum.init({
    applicationId: '898ea704-7347-45dc-b40c-bf85359e062e',
    clientToken: 'pub40fb07aa43d3f6f034d8fcc7f1df867b',
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
