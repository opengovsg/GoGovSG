import React, { FunctionComponent } from 'react'
import {
  Typography,
  makeStyles,
  createStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

type BetaTagProps = {}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontWeight: 400,
      background: '#8CA6AD',
      borderRadius: '5px',
      color: 'white',
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingRight: theme.spacing(2.5),
      paddingLeft: theme.spacing(2.5),
      [theme.breakpoints.up('md')]: {
        fontWeight: 500,
      },
    },
  }),
)

const BetaTag: FunctionComponent<BetaTagProps> = ({}: BetaTagProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.root}>
      <Typography variant={isMobileView ? 'body2' : 'h6'}>BETA</Typography>
    </div>
  )
}

export default BetaTag
