import React from 'react'
import { Link, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import classNames from 'classnames'
import LinkedinIcon from '../assets/linkedin-icon.svg'

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

const LinkedinWidget = ({ className }: BuiltByWidgetProps) => {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.builtByLinkGroup)}>
      <Link
        href={i18next.t('general.links.linkedin')}
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
