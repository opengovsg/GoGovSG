// Checks if the browser is IE11.
const checkIsIE = (): boolean => {
  return 'documentMode' in window.document
}

export default checkIsIE
