import React, { FunctionComponent } from 'react'
import Typed from 'react-typed'

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
        <Typed
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
