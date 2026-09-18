// Storybook-only stand-in for @datadog/browser-rum (aliased in
// .storybook/main.ts). src/client/app/helpers/monitoring.ts calls
// datadogRum.init(...) with real production credentials and
// sessionReplaySampleRate: 100 at module top-level (src/client/home/index.tsx)
// -- every story render would otherwise attempt to send real session-replay
// telemetry to production Datadog. No-op stubs cover every method the app
// actually calls (see the two callsites in src/client/app/helpers/monitoring.ts
// and src/client/login/actions/index.ts).
// Named export is required to match @datadog/browser-rum's real shape --
// consumers do `import { datadogRum } from '@datadog/browser-rum'`, so a
// default export here would break the alias substitution.
// oxlint-disable-next-line import/prefer-default-export
export const datadogRum = {
  init: () => {},
  startSessionReplayRecording: () => {},
  setUser: () => {},
  clearUser: () => {},
}
