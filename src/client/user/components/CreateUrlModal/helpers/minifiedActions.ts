import { useMediaQuery, useTheme } from '@mui/material'

export default function useMinifiedActions() {
  const theme = useTheme()
  // Minified actions are used only in xs and sm devices.
  //
  // noSsr evaluates the media query during the first render instead of after
  // the mount effect. Without it every consumer renders its minified branch
  // once, then swaps to the full branch a frame later -- remounting the
  // toolbar buttons on every page load. The app has no server-side rendering,
  // so there is no hydration mismatch to protect against.
  return !useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
}
