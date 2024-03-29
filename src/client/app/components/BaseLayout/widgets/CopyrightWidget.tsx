import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import i18next from 'i18next'
import { format } from 'date-fns-tz'

const useStyles = makeStyles((theme) =>
  createStyles({
    copyright: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    copyrightText: {
      fontSize: '0.75rem',
    },
    mobileFooter: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
  }),
)

type CopyrightWidgetProps = {
  className?: string
}

const CopyrightWidget = ({ className }: CopyrightWidgetProps) => {
  const classes = useStyles()
  return (
    <span className={classNames(className, classes.copyright)}>
      <Typography variant="caption" className={classes.copyrightText}>
        © {format(Date.now(), 'yyyy')} {i18next.t('general.copyright')},
        <br className={classes.mobileFooter} />{' '}
        {i18next.t('general.copyrightTag')}
      </Typography>
    </span>
  )
}

export default CopyrightWidget
