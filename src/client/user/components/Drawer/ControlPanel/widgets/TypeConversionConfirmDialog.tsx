import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'

type TypeConversionConfirmDialogProps = {
  open: boolean
  convertingToFile: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function TypeConversionConfirmDialog({
  open,
  convertingToFile,
  onCancel,
  onConfirm,
}: TypeConversionConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Change link type?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {convertingToFile
            ? 'This short link will stop redirecting to its current URL and will instead serve an uploaded file. The previous destination will no longer be reachable through this short link.'
            : 'This short link will stop serving its current file and will instead redirect to a URL. The previous file will no longer be accessible through this short link or its direct link.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
