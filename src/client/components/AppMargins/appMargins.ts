import { useMediaQuery, useTheme } from '@material-ui/core'

const useAppMargins = () => {
  const theme = useTheme()
  const xsWidth = useMediaQuery(theme.breakpoints.only('xs'))
  const smWidth = useMediaQuery(theme.breakpoints.only('sm'))
  const mdWidth = useMediaQuery(theme.breakpoints.only('md'))

  if (xsWidth) {
    return theme.spacing(4)
  }
  if (smWidth) {
    return theme.spacing(8)
  }
  if (mdWidth) {
    return theme.spacing(12)
  }
  return theme.spacing(16)
}

export default useAppMargins
