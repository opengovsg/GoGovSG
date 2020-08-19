import React, { useEffect } from 'react'
import i18next from 'i18next'

import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import { useSelector } from 'react-redux'
import { GoGovReduxState } from '../../../reducers/types'
import { EmailValidatorType } from '../../../actions/login/types'
import { LINK_DESCRIPTION_MAX_LENGTH } from '../../../../shared/constants'
import { isPrintableAscii } from '../../../../shared/util/validation'

import BetaTag from '../../widgets/BetaTag'
import CollapsibleMessage from '../../CollapsibleMessage'
import ConfigOption, { TrailingPosition } from './ConfigOption'
import PrefixableTextField from './PrefixableTextField'
import { CollapsibleMessageType, CollapsibleMessagePosition } from '../../CollapsibleMessage/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    regularText: {
      fontWeight: 400,
    },
    characterCount: {
      marginLeft: 2,
      marginTop: 9,
    },
    linkInformationHeaderWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1.25),
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(1),
      },
    },
    linkInformationHeader: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(1),
      },
    },
    linkInformationDesc: {
      marginBottom: theme.spacing(3),
      fontWeight: 400,
    },
    linkInformationDescHeader: {
      fontWeight: 500,
      marginBottom: theme.spacing(0.5),
    },
    hotlink: {
      color: '#384a51',
    },
  }),
)

type LinkInfoEditorProps = {
  contactEmail: string
  description: string
  onContactEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onContactEmailValidation: (isContactEmailValid: boolean) => void
  onDescriptionValidation: (isDescriptionValid: boolean) => void
}

export default function LinkInfoEditor({
  contactEmail, 
  description, 
  onContactEmailChange,
  onDescriptionChange,
  onContactEmailValidation,
  onDescriptionValidation,
}: LinkInfoEditorProps) {
  // Styles used in this component.
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  const emailValidator = useSelector<GoGovReduxState, EmailValidatorType>(
    (state) => state.login.emailValidator,
  )

  const isContactEmailValid =
    !contactEmail || emailValidator(contactEmail)
  const isDescriptionValid =
    description.length <= LINK_DESCRIPTION_MAX_LENGTH &&
    isPrintableAscii(description)

  useEffect(
    () => {
      onContactEmailValidation(isContactEmailValid)
    },
    [isContactEmailValid]
  )

  useEffect(
    () => {
      onDescriptionValidation(isDescriptionValid)
    },
    [isDescriptionValid]
  )

  const contactEmailHelp = (
    <>
      <span className={classes.linkInformationDescHeader}>Contact email</span>
      <br />
      Enter an email which the public can contact if they have queries about
      your short link.
    </>
  )

  const linkDescriptionHelp = (
    <>
      <span className={classes.linkInformationDescHeader}>
        Link description
      </span>
      <br />
      Write a description that will help the public understand what your short
      link is for.
    </>
  )

  return (
    <>
      <div className={classes.linkInformationHeaderWrapper}>
        <Typography
          variant="h3"
          className={classes.linkInformationHeader}
          color="primary"
        >
          Link information
        </Typography>
        <BetaTag />
      </div>
      <Typography variant="body2" className={classes.linkInformationDesc}>
        The information you enter below will be displayed on our{' '}
        <a href="https://go.gov.sg/go-search" className={classes.hotlink}>
          <u>GoSearch page (coming soon)</u>
        </a>
        , and the error page if users are unable to access your short link.
      </Typography>
      <ConfigOption
        title={contactEmailHelp}
        titleVariant="body2"
        titleClassName={classes.regularText}
        leading={
          <PrefixableTextField
            value={contactEmail}
            onChange={onContactEmailChange}
            placeholder=""
            helperText={
              isContactEmailValid
                ? ''
                : `This doesn't look like a valid ${i18next.t(
                    'general.emailDomain',
                  )} email.`
            }
            error={!isContactEmailValid}
          />
        }
        trailing={<></>}
        wrapTrailing={isMobileView}
        trailingPosition={TrailingPosition.none}
      />
      <ConfigOption
        title={linkDescriptionHelp}
        titleVariant="body2"
        titleClassName={classes.regularText}
        leading={
          <>
            <PrefixableTextField
              value={description}
              onChange={onDescriptionChange}
              error={!isDescriptionValid}
              placeholder="Tip: Include your agency name to inform the public who this link belongs to."
              helperText={
                isDescriptionValid
                  ? `${description.length}/${LINK_DESCRIPTION_MAX_LENGTH}`
                  : undefined
              }
              multiline
              rows={2}
              rowsMax={isMobileView ? 5 : undefined}
              FormHelperTextProps={{ className: classes.characterCount }}
            />
            <CollapsibleMessage
              type={CollapsibleMessageType.Error}
              visible={!isDescriptionValid}
              position={CollapsibleMessagePosition.Static}
              timeout={0}
            >
              {isPrintableAscii(description)
                ? `${description.length}/200`
                : 'Description should only contain alphanumeric characters and symbols.'}
            </CollapsibleMessage>
          </>
        }
        trailing={<></>}
        wrapTrailing={isMobileView}
        trailingPosition={TrailingPosition.none}
      />
    </>
  )
}
