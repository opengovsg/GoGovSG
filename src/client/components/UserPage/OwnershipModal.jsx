import React from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  IconButton,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import 'boxicons'

import userPageStyle from '~/styles/userPage'

const OwnershipModal = ({
  classes,
  ownershipModal,
  closeOwnershipModal,
  newOwner,
  setNewOwner,
  transferOwnership,
}) => (
  <Modal
    aria-labelledby="ownershipModal"
    aria-describedby="transferOwnership"
    open={Boolean(ownershipModal)}
    onClose={closeOwnershipModal}
  >
    <Paper className={classes.ownershipModal}>
      <div className={classes.ownershipModalHeader}>
        <Typography className={classes.ownershipModalTitle} variant="h3">
          {`/${ownershipModal}`}
        </Typography>
        <IconButton
          className={classes.closeIcon}
          onClick={closeOwnershipModal}
          size="small"
        >
          <box-icon size="sm" name="x" />
        </IconButton>
      </div>
      <div className={classes.ownershipModalBottomHalf}>
        <Typography
          className={classes.transferOwnershipTitle}
          variant="h4"
          gutterBottom
        >
          <strong>Transfer link ownership to</strong>
        </Typography>
        <TextField
          id="newOwner"
          variant="outlined"
          value={newOwner}
          onChange={(e) => {
            setNewOwner(e.target.value)
          }}
          InputProps={{
            classes: { input: classes.transferOwnershipInput },
          }}
          placeholder="Enter an existing user's email"
        />
        <Typography className={classes.transferOwnershipHint}>
          This link will be removed from your account once you transfer
          ownership to another user (must be an existing user).
        </Typography>
        <div className={classes.transferOwnershipBtns}>
          <Button
            className={classes.transferOwnershipSubmitBtn}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            onClick={() => transferOwnership(ownershipModal, newOwner)}
          >
            Transfer
          </Button>
          <Button
            className={classes.transferOwnershipCancelBtn}
            type="submit"
            size="large"
            onClick={() => closeOwnershipModal()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Paper>
  </Modal>
)

OwnershipModal.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  ownershipModal: PropTypes.string.isRequired,
  closeOwnershipModal: PropTypes.func.isRequired,
  newOwner: PropTypes.string.isRequired,
  setNewOwner: PropTypes.func.isRequired,
  transferOwnership: PropTypes.func.isRequired,
}

export default withStyles(userPageStyle)(OwnershipModal)
