import { useMediaQuery, useTheme } from '@material-ui/core'

export default function useMinifiedActions() {
  const theme = useTheme()
  // Minified actions are used only in xs and sm devices.
  return !useMediaQuery(theme.breakpoints.up('md'))
}
