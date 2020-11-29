import React, { FunctionComponent, useState } from 'react'
import {
  Tooltip,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import PrefixableTextField from '../../../../widgets/PrefixableTextField'
import TrailingButton from './TrailingButton'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import helpIcon from '../../../../../app/assets/help-icon.svg'
import { useDrawerState } from '../../index'
import useShortLink from '../util/shortlink'

const useStyles = makeStyles((theme) =>
  createStyles({
    drawerTooltip: {
      // margin: theme.spacing(1.5, 1, 1.5, 1),
      whiteSpace: 'nowrap',
      maxWidth: 'unset',
      [theme.breakpoints.up('md')]: {
        marginTop: '-12px',
        padding: '16px',
      },
    },
    ownershipHelpIcon: {
      width: '14px',
      verticalAlign: 'middle',
    },
    regularText: {
      fontWeight: 400,
    },
  }),
)

type LinkOwnershipFieldProps = {
  closeModal: () => void
}

const LinkOwnershipField: FunctionComponent<LinkOwnershipFieldProps> = ({ closeModal }) =>  {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerStates = useDrawerState()
  const { shortLinkDispatch } = useShortLink(drawerStates.relevantShortLink!)
  const [pendingOwner, setPendingOwner] = useState<string>('')

  const linkOwnershipHelp = (
    <>
      Link owner{' '}
      <Tooltip
        title="Links can only be transferred to an existing Go.gov.sg user"
        arrow
        placement="top"
        classes={{ tooltip: classes.drawerTooltip }}
      >
        <img
          className={classes.ownershipHelpIcon}
          src={helpIcon}
          alt="Ownership help"
          draggable={false}
        />
      </Tooltip>
    </>
  )

  return (
    <ConfigOption
      title={linkOwnershipHelp}
      titleVariant="body2"
      titleClassName={classes.regularText}
      leading={
        <PrefixableTextField
          value={pendingOwner}
          onChange={(event) => setPendingOwner(event.target.value)}
          placeholder="Email of link recipient"
          helperText={' '}
        />
      }
      trailing={
        <TrailingButton
          onClick={() => {
            shortLinkDispatch?.applyNewOwner(pendingOwner, closeModal)
          }}
          disabled={!pendingOwner}
          variant={isMobileView ? 'contained' : 'outlined'}
          fullWidth={isMobileView}
        >
          Transfer
        </TrailingButton>
      }
      wrapTrailing={isMobileView}
      trailingPosition={TrailingPosition.end}
    />
  )
}

export default LinkOwnershipField
