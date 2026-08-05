import React, { FunctionComponent } from 'react'
// react-typed's package.json resolves `types` to its ESM build even though
// `require` resolves to its CJS build; the require() call at runtime (via webpack) is correct.
// @ts-expect-error
import { ReactTyped } from 'react-typed'

type RotatingLinksType = {
  className?: string
  strings: string[]
  prefix: string
}

const RotatingLinks: FunctionComponent<RotatingLinksType> = ({
  className = '',
  strings,
  prefix,
}: RotatingLinksType) => {
  return (
    <main className={className}>
      {prefix}
      {strings && strings.length > 0 ? (
        <ReactTyped
          strings={strings}
          typeSpeed={80}
          backDelay={2500}
          smartBackspace={false}
          loop
        />
      ) : null}
    </main>
  )
}

export default RotatingLinks
