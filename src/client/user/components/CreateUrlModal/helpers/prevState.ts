import { useEffect, useRef } from 'react'

export default function usePrevState<T>(
  currentState: T,
  updateState: boolean = true,
): T {
  const prevState = useRef<T>(currentState)
  useEffect(() => {
    if (updateState) prevState.current = currentState
  })
  return prevState.current
}
