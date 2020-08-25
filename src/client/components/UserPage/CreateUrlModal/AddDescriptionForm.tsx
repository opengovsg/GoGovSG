import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, createStyles, makeStyles } from '@material-ui/core'
import LinkInfoEditor from '../widgets/LinkInfoEditor'
import ModalMargins from './ModalMargins'
import { patch } from '../../../util/requests'
import userActions from '../../../actions/user'
import rootActions from '../../../actions/root'
import { GoGovReduxState } from '../../../reducers/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    buttonWrapper: {
      display: 'flex',
      justifyContent: 'flex-end',
      flexDirection: 'column-reverse',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        marginBottom: 50,
      },
      marginBottom: 80,
    },
    skipButton: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 135,
      },
    },
    saveButton: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 135,
      },
    },
  }),
)

type AddDescriptionFormProps = {}

export default function AddDescriptionForm(_: AddDescriptionFormProps) {
  const classes = useStyles()

  const [contactEmail, setContactEmail] = useState('')
  const [isContactEmailValid, setIsContactEmailValid] = useState(true)
  const [description, setDescription] = useState('')
  const [isDescriptionValid, setIsDescriptionValid] = useState(true)
  const [isSearchable, setIsSearchable] = useState(true)
  const onIsSearchableChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setIsSearchable(event.target.checked)
  const onContactEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setContactEmail(event.target.value)
  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setDescription(event.target.value)

  const shortUrl = useSelector(
    (state: GoGovReduxState) => state.user.lastCreatedLink,
  )
  const dispatch = useDispatch()
  const closeCreateUrlModal = () => dispatch(userActions.closeCreateUrlModal())
  const updateLinkInformation = async () => {
    const response = await patch('/api/user/url', {
      contactEmail: contactEmail === '' ? null : contactEmail,
      description,
      shortUrl,
    })

    if (response.ok) {
      dispatch(userActions.getUrlsForUser())
      dispatch(rootActions.setSuccessMessage('URL is updated.'))
      closeCreateUrlModal()
      return
    }

    const jsonResponse = await response.json()
    dispatch(rootActions.setErrorMessage(jsonResponse.message))
  }

  const isBothFieldsBlank = contactEmail === '' && description === ''
  const isContainsInvalidField = !(isContactEmailValid && isDescriptionValid)
  const isSaveButtonDisabled = isBothFieldsBlank || isContainsInvalidField

  return (
    <div>
      {/* Temporarily suppress unusued variable name error. */}
      {isContactEmailValid && !isContactEmailValid && isDescriptionValid
        ? 'hi'
        : null}
      <ModalMargins>
        <LinkInfoEditor
          contactEmail={contactEmail}
          description={description}
          onContactEmailChange={onContactEmailChange}
          onDescriptionChange={onDescriptionChange}
          onContactEmailValidation={setIsContactEmailValid}
          onDescriptionValidation={setIsDescriptionValid}
          isSearchable={isSearchable}
          onIsSearchableChange={onIsSearchableChange}
          isMountedOnCreateUrlModal
        />
        <div className={classes.buttonWrapper}>
          <Button
            onClick={closeCreateUrlModal}
            size="large"
            color="primary"
            variant="text"
            className={classes.skipButton}
          >
            Skip for now
          </Button>
          <Button
            onClick={updateLinkInformation}
            disabled={isSaveButtonDisabled}
            color="primary"
            size="large"
            variant="contained"
            className={classes.saveButton}
          >
            Save
          </Button>
        </div>
      </ModalMargins>
    </div>
  )
}
