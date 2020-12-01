import React, { FunctionComponent, useState } from 'react'
import {
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import { useDrawerState } from '../../index'
import useShortLink from '../util/shortlink'
import DrawerTooltip from './DrawerTooltip'
import PrefixableTextField from '../../../../widgets/PrefixableTextField'
import TrailingButton from './TrailingButton'

type LinkOwnershipFieldProps = {
  closeModal: () => void
}

const LinkOwnershipField: FunctionComponent<LinkOwnershipFieldProps> = ({
  closeModal,
}) => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerStates = useDrawerState()
  const { shortLinkDispatch } = useShortLink(drawerStates.relevantShortLink!)
  const [pendingOwner, setPendingOwner] = useState<string>('')

  const linkOwnershipHelp = (
    <>
      Link owner{' '}
      <DrawerTooltip
        title="Links can only be transferred to an existing Go.gov.sg user"
        imageAltText="Ownership help"
      />
    </>
  )

  return (
    <ConfigOption
      title={linkOwnershipHelp}
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
