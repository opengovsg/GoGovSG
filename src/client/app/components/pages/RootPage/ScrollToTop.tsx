import React, { useEffect, useRef, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

const usePrevious = (value: string) => {
  const ref = useRef<string>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

type ScrollToTopProps = {
  children: ReactNode
}

const ScrollToTop = ({ children }: ScrollToTopProps) => {
  const location = useLocation().pathname
  const prevProps = usePrevious(location)
  useEffect(() => {
    if (!!prevProps && location !== prevProps) {
      window.scrollTo(0, 0)
    }
  })
  return <>{children}</>
}

export default ScrollToTop
