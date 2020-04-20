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
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.secondary.dark,
      padding: theme.spacing(6, 4),
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        padding: theme.spacing(6, 10),
      },
    },
    textContentWrapper: {
      [theme.breakpoints.up('md')]: {
        alignSelf: 'center',
      },
    },
    appDescriptionWrapper: {
      margin: theme.spacing(2, 0),
    },
    appTitle: {
      display: 'block',
      fontSize: '1.15rem',
      marginRight: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        display: 'inline',
      },
    },
    secondaryFooterWrapper: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
    },
    navLinksWrapper: {
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    },
    navLinkWrapper: {
      margin: theme.spacing(2, 0, 0, 1),
      [theme.breakpoints.up('md')]: {
        margin: theme.spacing(1, 2),
      },
    },
    navLink: {
      color: '#384A51',
      fontWeight: '500',
    },
    builtByLink: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        margin: theme.spacing(0),
      },
    },
    builtByImg: {
      height: '55px',
      pointerEvents: 'none',
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
      <div className={classes.textContentWrapper}>
        <span className={classes.appDescriptionWrapper}>
          <Typography
            className={classes.appTitle}
            variant="body2"
            color="textPrimary"
          >
            <strong>{i18next.t('general.appTitle')}</strong>
          </Typography>
          <Typography variant="body1" display="inline" color="textPrimary">
            <Trans>general.appCatchphrase.noStyle</Trans>
          </Typography>
        </span>
        <Grid className={classes.secondaryFooterWrapper} container spacing={2}>
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
          <span className={classes.navLinksWrapper}>
            {footers.map((footer) => (
              <Grid item key={footer.text} className={classes.navLinkWrapper}>
                <Typography variant="caption" gutterBottom>
                  <Link
                    className={classes.navLink}
                    color="primary"
                    target="_blank"
                    href={footer.link}
                  >
                    {footer.text}
                  </Link>
                </Typography>
              </Grid>
            ))}
          </span>
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
