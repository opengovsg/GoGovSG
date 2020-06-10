// Checks if the browser is IE11.
const useIsIE = (): boolean => {
  return 'documentMode' in window.document
}

export default useIsIE
