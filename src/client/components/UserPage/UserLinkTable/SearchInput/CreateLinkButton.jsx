import React from 'react'
import { useDispatch } from 'react-redux'
import userActions from '../../../../actions/user'
import RoundIconButton from './RoundIconButton'

export default function CreateLinkButton() {
  const dispatch = useDispatch()
  const openCreateUrlModal = () => dispatch(userActions.openCreateUrlModal())
  return (
    <RoundIconButton onClick={openCreateUrlModal}>
      <box-icon name="plus" />
    </RoundIconButton>
  )
}
