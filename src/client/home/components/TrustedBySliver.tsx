import React from 'react'
import { Grid, Typography, createStyles, makeStyles } from '@material-ui/core'
import trustedByMom from '@assets/components/home/trusted-by-sliver/1.png'
import trustedByLta from '@assets/components/home/trusted-by-sliver/2.png'
import trustedByMoh from '@assets/components/home/trusted-by-sliver/3.png'
import trustedByMsf from '@assets/components/home/trusted-by-sliver/4.png'
import trustedBySpf from '@assets/components/home/trusted-by-sliver/5.png'
import trustedByIras from '@assets/components/home/trusted-by-sliver/6.png'
import trustedByMoe from '@assets/components/home/trusted-by-sliver/7.png'
import trustedByMha from '@assets/components/home/trusted-by-sliver/8.png'

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

const trustedLogos = [
  { name: 'MOM', icon: trustedByMom },
  { name: 'LTA', icon: trustedByLta },
  { name: 'MOH', icon: trustedByMoh },
  { name: 'MSF', icon: trustedByMsf },
  { name: 'SPF', icon: trustedBySpf },
  { name: 'IRAS', icon: trustedByIras },
  { name: 'MOE', icon: trustedByMoe },
  { name: 'MHA', icon: trustedByMha },
]

const TrustedBySliver = () => {
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
