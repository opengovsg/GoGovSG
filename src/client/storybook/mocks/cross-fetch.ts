// Storybook-only stand-in for the `cross-fetch` package (aliased in
// .storybook/main.ts). Screens dispatch real thunks on mount that call
// src/client/app/util/requests.ts, which calls this. Returning a promise
// that never settles means those thunks never reach their `.then`/`.catch`,
// avoiding real network calls, timeouts, and unhandled rejections. It does
// NOT by itself guarantee a story's preloadedState survives untouched --
// several thunks dispatch a synchronous "pending" action before this fetch
// is even awaited, which still reaches the store. See the identity reducer
// in src/client/storybook/decorators.tsx for the guarantee that no
// dispatched action, pending or otherwise, can mutate a story's state.
const foreverPendingFetch = (): Promise<Response> => new Promise(() => {})

export default foreverPendingFetch
