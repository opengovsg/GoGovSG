import { useDispatch, useSelector } from 'react-redux'

import userActions from '../../../../../actions/user'
import { isValidLongUrl } from '../../../../../../shared/util/validation'
import { UrlType } from '../../../../../reducers/user/types'
import { GoGovReduxState } from '../../../../../reducers/types'

export type ShortLinkState = [
  UrlType | undefined,
  ShortLinkDispatch | undefined,
]

type Dispatch = () => (dispatch: any) => void

export type ShortLinkDispatch = {
  toggleStatus: Dispatch
  setEditLongUrl: Dispatch
  applyEditLongUrl: Dispatch
}

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
    setEditLongUrl: (editedUrl: string) => {
      dispatch(userActions.setEditedLongUrl(shortLink, editedUrl))
    },
    applyEditLongUrl: (editedUrl: string) => {
      if (!isValidLongUrl(editedUrl)) {
        throw new Error('Attempt to save an invalid long url.')
      }
      dispatch(userActions.updateLongUrl(shortLink, editedUrl))
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
