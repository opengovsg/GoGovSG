import React from 'react'
import { useDispatch } from 'react-redux'
import { Button, createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import userActions from '../../actions'

const useStyles = makeStyles((theme) =>
  createStyles({
    createButton: {
      width: 150,
      height: 44,
      marginTop: theme.spacing(4),
    },
  }),
)

type CreateButtonProps = {
  className?: string
}

export default function CreateButton({ className }: CreateButtonProps) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const openCreateUrlModal = () => dispatch(userActions.openCreateUrlModal())

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
