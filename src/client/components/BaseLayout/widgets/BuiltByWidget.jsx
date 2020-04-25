import React from 'react'
import { Link, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import classNames from 'classnames'
import BuiltByImg from '~/assets/built-by.png'

const useStyles = makeStyles((theme) =>
  createStyles({
    builtByLinkGroup: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    builtByImg: {
      height: '55px',
      userDrag: 'none',
    },
  }),
)

const BuiltByWidget = ({ className }) => {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.builtByLinkGroup)}>
      <Link
        href={i18next.t('general.links.builtBy')}
        target="_blank"
        style={{ height: '100%' }}
      >
        <img
          src={BuiltByImg}
          className={classes.builtByImg}
          alt={i18next.t('general.builtBy')}
        />
      </Link>
    </div>
  )
}

export default BuiltByWidget
