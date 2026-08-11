import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

import { useDrawerState } from '../../index'
import useShortLink from '../util/shortlink'
import GoSwitch from '../../../../widgets/GoSwitch'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'

const useStyles = makeStyles((theme) =>
  createStyles({
    activeText: {
      color: '#6d9067',
    },
    inactiveText: {
      color: '#c85151',
    },
    regularText: {
      fontWeight: 400,
    },
    stateSwitch: {
      marginTop: 0,
      marginBottom: theme.spacing(4),
    },
  }),
)

export default function LinkStateText() {
  const classes = useStyles()
  const drawerStates = useDrawerState()

  // Fetch short link state and dispatches from redux store through our helper hook.
  const { shortLinkState, shortLinkDispatch } = useShortLink(
    drawerStates.relevantShortLink!,
  )

  const stateTitleActive = (
    <>
      Your link is <span className={classes.activeText}>active</span> and
      publicly accessible
    </>
  )

  const stateTitleInactive = (
    <>
      Your link is <span className={classes.inactiveText}>inactive</span> and
      not publicly accessible
    </>
  )

  return (
    <ConfigOption
      title={[
        shortLinkState?.state === 'ACTIVE'
          ? stateTitleActive
          : stateTitleInactive,
        <Typography variant="body2" className={classes.regularText}>
          Share your link through{' '}
          <a href="https://postman.gov.sg" target="_blank" rel="noreferrer">
            Postman
          </a>
          , a mass messaging tool.
        </Typography>,
      ]}
      mobile
      trailing={
        <GoSwitch
          color="primary"
          checked={shortLinkState?.state === 'ACTIVE'}
          onChange={shortLinkDispatch?.toggleStatus}
          className={classes.stateSwitch}
        />
      }
      trailingPosition={TrailingPosition.center}
    />
  )
}
