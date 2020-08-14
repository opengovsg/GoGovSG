import React from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../widgets/CloseIcon'

import CreateLinkForm from './CreateLinkForm'
import useFullScreenDialog from './helpers/fullScreenDialog'
import ModalMargins from './ModalMargins'

const useStyles = makeStyles((theme) =>
  createStyles({
    headerDiv: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    headerText: {
      alignSelf: 'flex-end',
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(2),
    },
    closeIconButton: {
      fill: (props) =>
        props.isFullScreenDialog ? '#BBBBBB' : theme.palette.primary.dark,
      height: (props) => (props.isFullScreenDialog ? 44 : 30.8),
      width: (props) => (props.isFullScreenDialog ? 44 : 30.8),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: (props) => (props.isFullScreenDialog ? 0 : theme.spacing(2)),
      marginRight: (props) => (props.isFullScreenDialog ? 0 : theme.spacing(2)),
    },
    headerWrapper: {
      background: '#f9f9f9',
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        background: 'unset',
        boxShadow: 'unset',
      },
    },
  }),
)

const CreateUrlModal = ({ createUrlModal, closeCreateUrlModal, onSubmit }) => {
  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
  return (
    <Dialog
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullScreen={isFullScreenDialog}
      fullWidth={!isFullScreenDialog}
      maxWidth="md"
      open={createUrlModal}
      onClose={closeCreateUrlModal}
    >
      <div className={classes.headerWrapper}>
        <ModalMargins applyRightMargin={false}>
          <div className={classes.headerDiv}>
            <Typography
              className={classes.headerText}
              variant={isFullScreenDialog ? 'h6' : 'h3'}
              color="primary"
            >
              Create new link
            </Typography>
            <IconButton
              className={classes.closeIconButton}
              onClick={closeCreateUrlModal}
              size="small"
            >
              <CloseIcon size={isFullScreenDialog ? 36 : 24} />
            </IconButton>
          </div>
        </ModalMargins>
      </div>
      <CreateLinkForm onSubmitLink={onSubmit} />
    </Dialog>
  )
}

CreateUrlModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default CreateUrlModal
