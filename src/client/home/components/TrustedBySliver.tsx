import React from 'react'
import { Grid, Typography, createStyles, makeStyles } from '@material-ui/core'
import trustedBy1 from '@assets/components/home/trusted-by-sliver/1.png'
import trustedBy2 from '@assets/components/home/trusted-by-sliver/2.png'
import trustedBy3 from '@assets/components/home/trusted-by-sliver/3.png'
import trustedBy4 from '@assets/components/home/trusted-by-sliver/4.png'
import trustedBy5 from '@assets/components/home/trusted-by-sliver/5.png'
import trustedBy6 from '@assets/components/home/trusted-by-sliver/6.png'
import trustedBy7 from '@assets/components/home/trusted-by-sliver/7.png'
import trustedBy8 from '@assets/components/home/trusted-by-sliver/8.png'

import i18next from 'i18next'

const useStyles = makeStyles((theme) =>
  createStyles({
    trustedByText: {
      paddingBottom: theme.spacing(4),
    },
    trustedLogoGrid: {
      display: 'flex',
      userDrag: 'none',
      alignItems: 'center',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    trustedLogo: {
      userDrag: 'none',
      objectFit: 'contain',
      maxWidth: 'min(100%, 120px)',
      maxHeight: '70%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 'min(100%, 150px)',
      },
      [theme.breakpoints.up('lg')]: {
        maxWidth: 'min(100%, 180px)',
      },
      '@media screen\\0': {
        maxWidth: '120px',
        maxHeight: 'calc(0.7px * 120)',
        [theme.breakpoints.up('md')]: {
          maxWidth: '150px',
          maxHeight: 'calc(0.7px * 150)',
        },
        [theme.breakpoints.up('lg')]: {
          maxWidth: '180px',
          maxHeight: 'calc(0.7px * 180)',
        },
      },
    },
  }),
)

const TrustedBySliver = () => {
  const trustedLogos = [
    { name: i18next.t('homePage.trustedBy.1'), icon: trustedBy1 },
    { name: i18next.t('homePage.trustedBy.2'), icon: trustedBy2 },
    { name: i18next.t('homePage.trustedBy.3'), icon: trustedBy3 },
    { name: i18next.t('homePage.trustedBy.4'), icon: trustedBy4 },
    { name: i18next.t('homePage.trustedBy.5'), icon: trustedBy5 },
    { name: i18next.t('homePage.trustedBy.6'), icon: trustedBy6 },
    { name: i18next.t('homePage.trustedBy.7'), icon: trustedBy7 },
    { name: i18next.t('homePage.trustedBy.8'), icon: trustedBy8 },
  ]

  const classes = useStyles()
  return (
    <>
      <Typography
        className={classes.trustedByText}
        variant="h3"
        color="textPrimary"
        gutterBottom
      >
        Trusted by these agencies
      </Typography>
      <Grid container spacing={2}>
        {trustedLogos.map((trustedLogo) => (
          <Grid
            item
            className={classes.trustedLogoGrid}
            key={trustedLogo.name}
            xs={4}
            md={3}
          >
            <img
              className={classes.trustedLogo}
              src={trustedLogo.icon}
              alt={trustedLogo.name}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default TrustedBySliver
