import { useDispatch, useSelector } from 'react-redux'

import userActions from '../../../actions'
import { isValidLongUrl } from '../../../../../shared/util/validation'
import { UrlType } from '../../../reducers/types'
import { GoGovReduxState } from '../../../../app/reducers/types'

type Dispatch = () => (dispatch: any) => void

export type ShortLinkDispatch = {
  toggleStatus: Dispatch
  setEditLongUrl: Dispatch
  applyEditLongUrl: Dispatch
}

export type ShortLinkState = [
  UrlType | undefined,
  ShortLinkDispatch | undefined,
]

export default function useShortLink(shortLink: string) {
  const urls: UrlType[] = useSelector<GoGovReduxState, UrlType[]>(
    (state) => state.user.urls,
  )
  const urlState = urls.filter((url: UrlType) => url.shortUrl === shortLink)[0]
  const isUploading = useSelector<GoGovReduxState, boolean>(
    (state) => state.user.isUploading,
  )
  const dispatch = useDispatch()
  const dispatchOptions = {
    toggleStatus: () =>
      dispatch(userActions.toggleUrlState(shortLink, urlState.state)),
    toggleIsSearchable: (isSearchable: boolean) => {
      dispatch(userActions.toggleIsSearchable(shortLink, isSearchable))
    },
    setEditLongUrl: (editedUrl: string) => {
      dispatch(userActions.setEditedLongUrl(shortLink, editedUrl))
    },
    setEditDescription: (editedDesc: string) => {
      dispatch(userActions.setEditedDescription(shortLink, editedDesc))
    },
    setEditContactEmail: (editedContactEmail: string) => {
      dispatch(userActions.setEditedContactEmail(shortLink, editedContactEmail))
    },
    applyEditLongUrl: (editedUrl: string) => {
      if (!isValidLongUrl(editedUrl)) {
        throw new Error('Attempt to save an invalid long url.')
      }
      dispatch(userActions.updateLongUrl(shortLink, editedUrl))
    },
    applyEditInformation: () => {
      dispatch(userActions.updateUrlInformation(shortLink))
    },
    applyNewOwner: (newOwner: string, onSuccess: () => void) => {
      dispatch(userActions.transferOwnership(shortLink, newOwner, onSuccess))
    },
    replaceFile: (newFile: File | null, onError: (error: string) => void) => {
      if (!newFile) {
        return
      }
      dispatch(userActions.replaceFile(shortLink, newFile, onError))
    },
  }

  return {
    shortLinkState: shortLink ? urlState : undefined,
    shortLinkDispatch: shortLink ? dispatchOptions : undefined,
    isUploading,
  }
}
