import React from 'react'
import useAppDispatch from '../../../app/hooks'

import { Button } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
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
  const dispatch = useAppDispatch()
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
