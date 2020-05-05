import { useMediaQuery, useTheme } from '@material-ui/core'

const useFullScreenDialog = () => {
  const theme = useTheme()
  // Full screen dialogs will only be used for xs devices.
  return !useMediaQuery(theme.breakpoints.up('sm'))
}

export default useFullScreenDialog
