import React, { useState } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  Divider,
  Hidden,
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
    linkAnalyticsDiv: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '141px',
    },
    linkAnalyticsText: {
      marginTop: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    titleText: {
      marginBottom: 10,
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
      <Typography className={classes.titleText} variant="h3" color="primary">
        Link analytics
      </Typography>
      <Typography
        className={classes.subtitleText}
        variant="body1"
        color="primary"
      >
        View real-time analytics of your link, and sort by time period.
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
  if (!Boolean(linkStatistics.status)) {
    return (
      <div className={classes.root}>
        <CircularProgress className={classes.circularProgress} />
      </div>
    )
  }

  if (!Boolean(linkStatistics.contents)) {
    return (
      <Typography variant="body1">
        There is no statistics to show right now.
      </Typography>
    )
  }

  return <Graphs data={linkStatistics.contents!} />
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
  totalClicks: {
    marginLeft: 'auto',
    marginRight: 39,
    alignSelf: 'center',
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
}))

export type GraphsProps = {
  data: LinkStatisticsInterface
}

function Graphs(props: GraphsProps) {
  const classes = useStyles()
  const theme = useTheme()
  const [tabValue, setTabValue] = useState<number>(0)

  const handleChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue)
  }

  const getIconStyle = (index: number) => {
    if (tabValue === index) {
      return classes.tabIcon
    }
    return classes.tabIconDisabled
  }

  return (
    <div className={classes.root}>
      <div className={classes.tabRoot}>
        <div className={classes.tabSection}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            className={classes.tabBar}
            indicatorColor={'primary'}
          >
            <Tab
              label={
                <div className={classes.tab}>
                  <img src={devicesLogo} className={getIconStyle(0)} /> Devices
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
                  <img src={trafficLogo} className={getIconStyle(2)} /> Traffic
                </div>
              }
            />
          </Tabs>
          <Hidden smDown>
            <Typography variant="h6" className={classes.totalClicks}>
              {`${props.data.totalClicks} total clicks`}
            </Typography>
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
  )
}
