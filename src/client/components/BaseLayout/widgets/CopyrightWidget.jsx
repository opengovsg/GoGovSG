import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import i18next from 'i18next'

const useStyles = makeStyles((theme) =>
  createStyles({
    copyright: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    copyrightText: {
      fontSize: '0.75rem',
    },
  }),
)

const CopyrightWidget = ({ className }) => {
  const classes = useStyles()
  return (
    <span className={classNames(className, classes.copyright)}>
      <Typography
        variant="caption"
        color="textPrimary"
        className={classes.copyrightText}
      >
        {i18next.t('general.copyright')}
      </Typography>
    </span>
  )
}

export default CopyrightWidget
