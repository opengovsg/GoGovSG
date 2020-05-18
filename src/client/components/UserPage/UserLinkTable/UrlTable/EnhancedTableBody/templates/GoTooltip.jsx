import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'

export default function GoTooltip({ children, onClose, title }) {
  return (
    <Tooltip title={title} onClose={onClose} arrow placement="top">
      {children}
    </Tooltip>
  )
}

GoTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string.isRequired,
}

GoTooltip.defaultProps = {
  onClose: undefined,
}
