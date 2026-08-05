import { ReactNode, useEffect, useRef } from 'react'
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

function ScrollToTop({ children }: ScrollToTopProps): JSX.Element {
  const location = useLocation().pathname
  const prevProps = usePrevious(location)
  useEffect(() => {
    if (!!prevProps && location !== prevProps) {
      window.scrollTo(0, 0)
    }
  })
  return children as JSX.Element
}

export default ScrollToTop
