import { datadogRum } from '@datadog/browser-rum'
import { ddEnv, ddService } from '../../../shared/util/environment-variables.js'

const initMonitoring = () => {
  datadogRum.init({
    applicationId: '898ea704-7347-45dc-b40c-bf85359e062e',
    clientToken: 'pub40fb07aa43d3f6f034d8fcc7f1df867b',
    site: 'datadoghq.com',
    service: ddService,
    env: ddEnv,
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
    allowedTracingUrls: [
      'https://go.gov.sg',
      'https://for.edu.sg',
      'https://for.sg',
      'https://staging.go.gov.sg',
      'https://staging.for.edu.sg',
      'https://staging.for.sg',
    ],
  })
  datadogRum.startSessionReplayRecording()
}

export default initMonitoring
