import { useMediaQuery, useTheme } from '@mui/material'

const useAppMargins = () => {
  const theme = useTheme()
  const xsWidth = useMediaQuery(theme.breakpoints.only('xs'))
  const smWidth = useMediaQuery(theme.breakpoints.only('sm'))
  const mdWidth = useMediaQuery(theme.breakpoints.only('md'))

  if (xsWidth) {
    return parseFloat(theme.spacing(4))
  }
  if (smWidth) {
    return parseFloat(theme.spacing(8))
  }
  if (mdWidth) {
    return parseFloat(theme.spacing(12))
  }
  return parseFloat(theme.spacing(16))
}

export default useAppMargins
