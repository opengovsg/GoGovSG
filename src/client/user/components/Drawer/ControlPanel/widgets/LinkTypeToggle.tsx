import React from 'react'
import LinkIcon from '../../../../widgets/LinkIcon'
import FileIcon from '../../../../widgets/FileIcon'
import CreateTypeButton from '../../../CreateUrlModal/components/CreateTypeButton'
import useCreateLinkFormStyles from '../../../CreateUrlModal/styles/createLinkForm'

type LinkTypeToggleProps = {
  isFile: boolean
  onChange: (isFile: boolean) => void
}

export default function LinkTypeToggle({
  isFile,
  onChange,
}: LinkTypeToggleProps) {
  const classes = useCreateLinkFormStyles({
    textFieldHeight: 44,
    uploadFileError: null,
    createShortLinkError: null,
  })

  return (
    <div className={classes.linkTypeWrapper}>
      <CreateTypeButton
        InputProps={{ classes }}
        Icon={LinkIcon}
        isEnabled={isFile}
        onChange={() => onChange(false)}
      >
        To a URL
      </CreateTypeButton>
      <CreateTypeButton
        InputProps={{ classes }}
        Icon={FileIcon}
        isEnabled={!isFile}
        onChange={() => onChange(true)}
      >
        To a File
      </CreateTypeButton>
    </div>
  )
}
