import { useEffect, useState } from 'react'

const useRotatingLinks = ({ linksToRotate, timeInternalInMs }) => {
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0)
  useEffect(() => {
    const intervalRef = setTimeout(() => {
      setCurrentLinkIndex((currentLinkIndex + 1) % linksToRotate.length)
    }, timeInternalInMs)
    return () => clearInterval(intervalRef)
  })
  return linksToRotate[currentLinkIndex]
}

export default useRotatingLinks
