// Storybook-only stand-in for the `cross-fetch` package (aliased in
// .storybook/main.ts). Screens dispatch real thunks on mount that call
// src/client/app/util/requests.ts, which calls this. Returning a promise
// that never settles means those thunks never reach their `.then`/reducer
// update, so a story's preloadedState stays the single source of truth for
// what's rendered instead of being overwritten mid-snapshot.
const foreverPendingFetch = (): Promise<Response> => new Promise(() => {})

export default foreverPendingFetch
