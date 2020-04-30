import React from 'react'
import Typed from 'react-typed'

const RotatingLinks = ({ className, strings, prefix }) => {
  return (
    <main className={className}>
      {prefix}
      <Typed
        strings={strings}
        typeSpeed={80}
        backDelay={2500}
        smartBackspace={false}
        loop
      />
    </main>
  )
}

export default RotatingLinks
