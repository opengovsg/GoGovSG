import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'

import { DeviceClicksInterface } from '../../../../../../shared/interfaces/link-statistics'
import FlexibleBar from './widgets/DeviceStatistics/FlexibleBar'
import DeviceLegend from './widgets/DeviceStatistics/DeviceLegend'
import BaseStatisticsLayout from './BaseStatisticsLayout'

export type ProcessedStatistic = {
  label: string
  count: number
  color: string
}

/**
 * Process device clicks data by adding in labels and relevant color codes.
 *
 * @param data The device clicks data to be processed.
 */
function processStatistics(data: DeviceClicksInterface): ProcessedStatistic[] {
  return [
    { label: 'Desktop', count: data.desktop, color: '#384A51' },
    { label: 'Tablet', count: data.tablet, color: '#8CA6AD' },
    { label: 'Mobile', count: data.mobile, color: '#CDDCE0' },
    { label: 'Others', count: data.others, color: '#E8E8E8' },
  ]
}

/**
 * Calculate a percentage with rounded one dp.
 *
 * @param count The count of the portion.
 * @param total The sum of all counts in all portions.
 */
function getFormattedPercent(count: number, total: number): number {
  const percent = (count * 100) / total
  return Math.round(percent * 10) / 10
}

const useStyles = makeStyles((theme) => ({
  devicesRoot: {
    display: 'flex',
    height: 30,
    borderRadius: 30,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 20,
  },
  legendRoot: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'unset',
    },
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      marginRight: 40,
      alignItems: 'unset',
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
}))

export type DeviceStatisticsProps = {
  deviceClicks: DeviceClicksInterface
}

export default function DeviceStatistics({
  deviceClicks,
}: DeviceStatisticsProps) {
  const classes = useStyles()
  const processedDeviceClicks = processStatistics(deviceClicks)
  const totalClicks = processedDeviceClicks
    .map((clicks) => clicks.count)
    .reduce((x, y) => x + y, 0)

  return (
    <BaseStatisticsLayout title="What devices are your users on?">
      <div className={classes.devicesRoot}>
        {processedDeviceClicks.map((clicks) => (
          <FlexibleBar
            label={clicks.label}
            count={clicks.count}
            color={clicks.color}
          />
        ))}
      </div>
      <div className={classes.legendRoot}>
        {processedDeviceClicks.map((clicks) => {
          const percent = getFormattedPercent(clicks.count, totalClicks)
          return (
            <DeviceLegend
              key={clicks.label}
              className={classes.legend}
              percent={percent}
              dotColor={clicks.color}
              label={clicks.label}
            />
          )
        })}
      </div>
    </BaseStatisticsLayout>
  )
}
