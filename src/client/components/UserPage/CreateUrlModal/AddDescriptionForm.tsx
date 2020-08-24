import React, { useState } from 'react'
import LinkInfoEditor from '../widgets/LinkInfoEditor'
import ModalMargins from './ModalMargins'

type AddDescriptionFormProps = {}

export default function AddDescriptionForm(_: AddDescriptionFormProps) {
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
      </ModalMargins>
    </div>
  )
}
