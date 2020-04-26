import React from 'react'
import { Grid, Typography, createStyles, makeStyles } from '@material-ui/core'
import trustedByMom from '~/assets/trusted-by-logos/1.png'
import trustedByLta from '~/assets/trusted-by-logos/2.png'
import trustedByMoh from '~/assets/trusted-by-logos/3.png'
import trustedByMsf from '~/assets/trusted-by-logos/4.png'
import trustedBySpf from '~/assets/trusted-by-logos/5.png'
import trustedByIras from '~/assets/trusted-by-logos/6.png'
import trustedByMoe from '~/assets/trusted-by-logos/7.png'
import trustedByMha from '~/assets/trusted-by-logos/8.png'

const useStyles = makeStyles((theme) =>
  createStyles({
    trustedByText: {
      paddingBottom: theme.spacing(4),
    },
    trustedLogoGrid: {
      display: 'flex',
      userDrag: 'none',
      alignItems: 'center',
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
        variant="h2"
        color="textPrimary"
        gutterBottom
      >
        Trusted by these agencies
      </Typography>
      <Grid container spacing={4}>
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
