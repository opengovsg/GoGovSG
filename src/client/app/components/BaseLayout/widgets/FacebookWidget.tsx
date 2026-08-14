import React from 'react'
import { Link } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import i18next from 'i18next'
import classNames from 'classnames'
import FacebookIcon from '@assets/widgets/app/facebook-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    builtByLinkGroup: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    builtByImg: {
      height: '25px',
      userDrag: 'none',
    },
  }),
)

type BuiltByWidgetProps = {
  className?: string
}

function FacebookWidget({ className }: BuiltByWidgetProps) {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.builtByLinkGroup)}>
      <Link
        href={i18next.t('general.links.facebook') as string}
        target="_blank"
        style={{ height: '100%' }}
      >
        <img
          src={FacebookIcon}
          className={classes.builtByImg}
          alt={i18next.t('general.builtBy')}
        />
      </Link>
    </div>
  )
}

export default FacebookWidget
