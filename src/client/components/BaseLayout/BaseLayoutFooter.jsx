import React from 'react'
import {
  Grid,
  Hidden,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { Trans } from 'react-i18next'
import i18next from 'i18next'
import BuiltByImg from '~/assets/built-by.png'

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.secondary.dark,
      padding: theme.spacing(4, 10),
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(4, 4),
      },
    },
    footerTitle: {
      display: 'inline',
      fontSize: '1.15rem',
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    subfooter: {
      paddingTop: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        paddingLeft: theme.spacing(1),
      },
    },
    footerItem: {
      [theme.breakpoints.down('xs')]: {
        padding: '8px 13px 8px 0 !important',
      },
    },
    footerLink: {
      fontWeight: '500',
    },
    builtByLink: {
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(5, 0, 1),
      },
    },
    builtByImg: {
      height: '55px',
      userDrag: 'none',
    },
  }),
)

const footers = [
  { text: 'FAQ', link: i18next.t('general.links.faq') },
  {
    text: 'Help us improve',
    link: i18next.t('general.links.contact'),
  },
  { text: 'Privacy', link: i18next.t('general.links.privacy') },
  { text: 'Terms of Use', link: i18next.t('general.links.terms') },
]

const BaseLayoutFooter = () => {
  const classes = useStyles()
  return (
    <footer className={classes.footer}>
      <div>
        <Typography
          variant="body2"
          color="textPrimary"
          className={classes.footerTitle}
        >
          <strong>{i18next.t('general.appTitle')}</strong>
        </Typography>
        <Typography variant="body1" display="inline" color="textPrimary">
          <Trans>general.appCatchphrase.noStyle</Trans>
        </Typography>
        <Grid container spacing={2} className={classes.subfooter}>
          <Hidden smDown>
            <Grid item>
              <Typography variant="caption" color="textPrimary" gutterBottom>
                {i18next.t('general.copyright')}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="caption" color="textPrimary" gutterBottom>
                |
              </Typography>
            </Grid>
          </Hidden>
          {footers.map((footer) => (
            <Grid item key={footer.text} className={classes.footerItem}>
              <Typography variant="caption" gutterBottom>
                <Link
                  className={classes.footerLink}
                  color="primary"
                  target="_blank"
                  href={footer.link}
                >
                  {footer.text}
                </Link>
              </Typography>
            </Grid>
          ))}
        </Grid>
      </div>
      <Link
        className={classes.builtByLink}
        href={i18next.t('general.links.builtBy')}
        target="_blank"
      >
        <img
          src={BuiltByImg}
          className={classes.builtByImg}
          alt={i18next.t('general.builtBy')}
        />
      </Link>
      <Hidden mdUp>
        <Typography variant="caption" color="textSecondary" gutterBottom>
          {i18next.t('general.copyright')}
        </Typography>
      </Hidden>
    </footer>
  )
}

export default BaseLayoutFooter
