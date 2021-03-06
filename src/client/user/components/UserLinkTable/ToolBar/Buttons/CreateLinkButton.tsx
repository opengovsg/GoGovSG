import React from 'react'
import { useDispatch } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'

import addIcon from '@assets/components/user/user-link-table/toolbar/add-icon.svg'
import userActions from '../../../../actions'
import ContainedIconButton from './templates/ContainedIconButton'
import useMinifiedActions from '../../../CreateUrlModal/helpers/minifiedActions'
import OvalContainedButton from './templates/OvalContainedButton'

const useStyles = makeStyles((theme) =>
  createStyles({
    createLinkButtonContainer: {
      marginLeft: theme.spacing(1.5),
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    },
  }),
)

const CreateLinkButton = () => {
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

export default CreateLinkButton
