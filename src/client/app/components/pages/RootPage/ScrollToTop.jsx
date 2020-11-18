import React, { useEffect, useRef } from 'react'
import { withRouter } from 'react-router-dom'

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const ScrollToTop = ({ children, location }) => {
  const prevProps = usePrevious({ location })
  useEffect(() => {
    if (!!prevProps && location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  })
  return <>{children}</>
}

export default withRouter(ScrollToTop)
