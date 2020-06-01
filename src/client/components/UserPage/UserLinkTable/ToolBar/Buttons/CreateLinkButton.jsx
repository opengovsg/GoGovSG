import React from 'react'
import { useDispatch } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'

import userActions from '../../../../../actions/user'
import ContainedIconButton from './templates/ContainedIconButton'
import useMinifiedActions from '../../../CreateUrlModal/helpers/minifiedActions'
import OvalContainedButton from './templates/OvalContainedButton'
import addIcon from '../assets/add-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    createLinkButtonContainer: {
      marginLeft: theme.spacing(1.5),
      flexShrink: 0,
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
          <img src={addIcon} alt="Create link" />
        </ContainedIconButton>
      ) : (
        <OvalContainedButton onClick={openCreateUrlModal}>
          Create link
        </OvalContainedButton>
      )}
    </span>
  )
}
