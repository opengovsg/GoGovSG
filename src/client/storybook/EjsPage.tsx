import React from 'react'
import ejs from 'ejs'

type EjsPageProps = {
  template: string
  data?: Record<string, unknown>
  // Maps an include()'d path (e.g. 'partial-masthead') to that partial's raw
  // EJS source. ejs.render() has no filesystem access in the browser, so
  // includes must be resolved this way instead of via the `filename` option.
  includes?: Record<string, string>
}

// Renders a server-side EJS view (src/server/views/*.ejs) exactly as Express
// would, inside an iframe so its own <head>/styles/scripts are fully
// isolated from the Storybook preview's own React app and theme.
const EjsPage = ({ template, data = {}, includes = {} }: EjsPageProps) => {
  const html = ejs.render(template, data, {
    includer: (path) => {
      const includeSource = includes[path]
      if (!includeSource) {
        throw new Error(
          `EjsPage: no include provided for '${path}' -- pass it via the includes prop.`,
        )
      }
      return { template: includeSource }
    },
  })

  return (
    <iframe
      title="EJS page preview"
      srcDoc={html}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  )
}

export default EjsPage
