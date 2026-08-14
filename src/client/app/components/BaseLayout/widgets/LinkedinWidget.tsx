import React from 'react'
import { Link } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import i18next from 'i18next'
import classNames from 'classnames'
import LinkedinIcon from '@assets/widgets/app/linkedin-icon.svg'

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

function LinkedinWidget({ className }: BuiltByWidgetProps) {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.builtByLinkGroup)}>
      <Link
        href={i18next.t('general.links.linkedin') as string}
        target="_blank"
        style={{ height: '100%' }}
      >
        <img
          src={LinkedinIcon}
          className={classes.builtByImg}
          alt={i18next.t('general.builtBy')}
        />
      </Link>
    </div>
  )
}

export default LinkedinWidget
