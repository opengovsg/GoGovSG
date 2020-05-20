import React from 'react'
import { useDispatch } from 'react-redux'
import { Button, createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import userActions from '../../../actions/user'

const useStyles = makeStyles((theme) =>
  createStyles({
    createButton: {
      width: '180px',
      minWidth: '140px',
      marginTop: theme.spacing(4),
    },
  }),
)

type CreateButtonProps = {
  className?: string
}

export default function CreateButton({ className }: CreateButtonProps) {
  const classes = useStyles()
  const openCreateUrlModal = () =>
    useDispatch()(userActions.openCreateUrlModal())

  return (
    <Button
      size="large"
      color="primary"
      variant="contained"
      onClick={openCreateUrlModal}
      className={classNames(className, classes.createButton)}
    >
      Create link
    </Button>
  )
}
