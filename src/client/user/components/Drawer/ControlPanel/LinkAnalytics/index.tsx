import React, { useEffect, useState } from 'react'
import {
  CircularProgress,
  Divider,
  Hidden,
  Tab,
  Tabs,
  Typography,
  createStyles,
  makeStyles,
  useTheme,
} from '@material-ui/core'

import { useDrawerState } from '../..'
import { useStatistics } from './util/statistics'
import DeviceStatistics from './DeviceStatistics'
import { LinkStatisticsInterface } from '../../../../../../shared/interfaces/link-statistics'
import DailyStatistics from './DailyStatistics'
import HeatMapStatistics from './HeatMapStatistics'

import devicesLogo from './assets/devices-logo.svg'
import clicksLogo from './assets/chart-logo.svg'
import trafficLogo from './assets/traffic-logo.svg'
import BetaTag from '../../../../../app/components/widgets/BetaTag'
import { GAEvent, GAPageView } from '../../../../../app/util/ga'

const useLinkAnalyticsStyles = makeStyles((theme) =>
  createStyles({
    dialogTitleDiv: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 116,
      marginBottom: 44,
    },
    copyLinkDiv: {
      display: 'flex',
    },
    copyIcon: {
      marginRight: 5,
    },
    linkAnalyticsTitle: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
    },
    linkAnalyticsDiv: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '60px',
    },
    linkAnalyticsText: {
      marginTop: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    titleText: {
      marginRight: 16,
    },
    subtitleText: {
      marginBottom: 20,
    },
    feedbackButton: {
      height: 44,
      width: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 200,
      },
    },
  }),
)

export default function LinkAnalytics() {
  const classes = useLinkAnalyticsStyles()

  return (
    <div className={classes.linkAnalyticsDiv}>
      <div id="link-analytics" className={classes.linkAnalyticsTitle}>
        <Typography className={classes.titleText} variant="h3" color="primary">
          Link analytics
        </Typography>
        <BetaTag />
      </div>
      <Typography
        className={classes.subtitleText}
        variant="body1"
        color="primary"
      >
        View real-time analytics of your link, and sort by time period (coming
        soon).
      </Typography>
      <LinkStatisticsGraphs />
    </div>
  )
}

const useLinkStatisticsGraphsStyles = makeStyles(() => ({
  root: {
    margin: 20,
  },
  circularProgress: {
    display: 'flex',
    justifyContent: 'center',
  },
}))

function LinkStatisticsGraphs() {
  const classes = useLinkStatisticsGraphsStyles()
  const shortUrl = useDrawerState().relevantShortLink!
  const linkStatistics = useStatistics(shortUrl)

  // Still fetching link statistics.
  if (!linkStatistics.status) {
    return (
      <div className={classes.root}>
        <CircularProgress className={classes.circularProgress} />
      </div>
    )
  }

  if (!linkStatistics.contents) {
    return (
      <Typography variant="body1">
        There are no statistics to show right now.
      </Typography>
    )
  }

  return <Graphs data={linkStatistics.contents!} shortUrl={shortUrl} />
}

export type TabPanelProps = {
  children?: React.ReactNode
  dir?: string
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Typography>{children}</Typography>}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 20,
    marginBottom: 20,
  },
  tabRoot: {
    border: 'solid 1px #CDDCE0',
    borderRadius: 3,
  },
  tabSection: {
    display: 'flex',
  },
  tabBar: {
    marginTop: 46,
  },
  tab: {
    display: 'flex',
    alignContent: 'center',
  },
  tabIcon: {
    width: 15,
    marginRight: 6.67,
  },
  tabIconDisabled: {
    width: 15,
    marginRight: 6.67,
    opacity: 0.7,
  },
  totalClicks: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  totalClicksMobile: {
    display: 'flex',
    alignItems: 'center',
  },
  totalClicksIcon: {
    height: 18,
    marginRight: 12,
  },
  totalClicksIconMobile: {
    width: 10.67,
    height: 12,
    marginRight: 7.67,
  },
  totalClicksText: {
    marginLeft: 0,
    marginRight: 39,
    alignSelf: 'center',
  },
}))

export type GraphsProps = {
  data: LinkStatisticsInterface
  shortUrl: string
}

function Graphs(props: GraphsProps) {
  const classes = useStyles()
  const theme = useTheme()
  const [tabValue, setTabValue] = useState<number>(0)

  // Map number to type for display
  const daMap = new Map<Number, string>()
  daMap.set(0, 'device')
  daMap.set(1, 'clicks')
  daMap.set(2, 'traffic')

  useEffect(() => {
    // Google Analytics: default device page and event on opening drawer
    GAPageView('DEVICE PAGE')
    GAEvent('drawer page analytics data', 'device', `/${props.shortUrl}`)

    return () => {
      GAPageView('USER PAGE')
    }
  }, [])

  const handleChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue)

    // Google Analytics: analytics data on device, clicks and traffics
    const daType: string = daMap.get(newValue) || 'DEVICE PAGE'
    GAPageView(`${daType.toUpperCase()} PAGE`)
    GAEvent('drawer page analytics data', daType, `/${props.shortUrl}`)
  }

  const getIconStyle = (index: number) => {
    if (tabValue === index) {
      return classes.tabIcon
    }
    return classes.tabIconDisabled
  }

  return (
    <>
      <Hidden mdUp>
        <div className={classes.totalClicksMobile}>
          <img src={clicksLogo} className={classes.totalClicksIconMobile} />
          <Typography
            variant="body2"
            color="primary"
            className={classes.totalClicksText}
          >
            {`${props.data.totalClicks} total clicks`}
          </Typography>
        </div>
      </Hidden>
      <div className={classes.root}>
        <div className={classes.tabRoot}>
          <div className={classes.tabSection}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              className={classes.tabBar}
              indicatorColor="primary"
            >
              <Tab
                label={
                  <div className={classes.tab}>
                    <img src={devicesLogo} className={getIconStyle(0)} />{' '}
                    Devices
                  </div>
                }
              />
              <Tab
                label={
                  <div className={classes.tab}>
                    <img src={clicksLogo} className={getIconStyle(1)} /> Clicks
                  </div>
                }
              />
              <Tab
                label={
                  <div className={classes.tab}>
                    <img src={trafficLogo} className={getIconStyle(2)} />{' '}
                    Traffic
                  </div>
                }
              />
            </Tabs>
            <Hidden smDown>
              <div className={classes.totalClicks}>
                <img src={clicksLogo} className={classes.totalClicksIcon} />
                <Typography variant="h6" className={classes.totalClicksText}>
                  {`${props.data.totalClicks} total clicks`}
                </Typography>
              </div>
            </Hidden>
          </div>
          <Divider />
          <TabPanel value={tabValue} index={0} dir={theme.direction}>
            <DeviceStatistics deviceClicks={props.data.deviceClicks} />
          </TabPanel>
          <TabPanel value={tabValue} index={1} dir={theme.direction}>
            <DailyStatistics dailyClicks={props.data.dailyClicks} />
          </TabPanel>
          <TabPanel value={tabValue} index={2} dir={theme.direction}>
            <HeatMapStatistics weekdayClicks={props.data.weekdayClicks} />
          </TabPanel>
        </div>
      </div>
    </>
  )
}
