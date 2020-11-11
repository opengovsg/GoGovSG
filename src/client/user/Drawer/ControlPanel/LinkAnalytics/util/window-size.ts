import { useEffect, useState } from 'react'

export const useWindowSize = () => {
  const isClient = typeof window === 'object'

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    }
  }

  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    if (!isClient) return
    const handleResize = () => setWindowSize(getSize())
    window.addEventListener('resize', handleResize)
    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return windowSize
}

export default useWindowSize
