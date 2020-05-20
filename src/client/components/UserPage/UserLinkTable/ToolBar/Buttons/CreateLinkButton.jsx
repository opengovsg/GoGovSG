import React from 'react'
import { useDispatch } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'

import userActions from '../../../../../actions/user'
import ContainedIconButton from './templates/ContainedIconButton'
import useMinifiedActions from '../util/minifiedActions'
import OvalContainedButton from './templates/OvalContainedButton'

const useStyles = makeStyles((theme) =>
  createStyles({
    createLinkButtonContainer: {
      marginLeft: theme.spacing(2.5),
    },
  }),
)

export default function CreateLinkButton() {
  const dispatch = useDispatch()
  const openCreateUrlModal = () => dispatch(userActions.openCreateUrlModal())
  const classes = useStyles()
  return (
    <span className={classes.createLinkButtonContainer}>
      {useMinifiedActions() ? (
        <ContainedIconButton onClick={openCreateUrlModal}>
          <box-icon name="plus" />
        </ContainedIconButton>
      ) : (
        <OvalContainedButton onClick={openCreateUrlModal}>
          Create link
        </OvalContainedButton>
      )}
    </span>
  )
}
