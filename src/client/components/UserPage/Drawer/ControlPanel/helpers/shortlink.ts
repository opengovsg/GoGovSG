import { useDispatch, useSelector } from 'react-redux'

import userActions from '../../../../../actions/user'
import { isValidLongUrl } from '../../../../../../shared/util/validation'

export type LinkState = {
  clicks: number
  createdAt: string
  editedLongUrl: string
  isFile: boolean
  longUrl: string
  shortUrl: string
  state: string
  updatedAt: string
  userId: number
}

export type ShortLinkState = [
  LinkState | undefined,
  ShortLinkDispatch | undefined,
]

type Dispatch = () => (dispatch: any) => void

export type ShortLinkDispatch = {
  toggleStatus: Dispatch
  setEditLongUrl: Dispatch
  applyEditLongUrl: Dispatch
}

export default function useShortLink(shortLink: string) {
  const urls: LinkState[] = useSelector((state: any) => state.user.urls)
  const urlState = urls.filter(
    (url: LinkState) => url.shortUrl === shortLink,
  )[0]
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
<<<<<<< HEAD
    applyNewOwner: (newOwner: string) => {
      dispatch(userActions.transferOwnership(shortLink, newOwner))
=======
    applyNewOwner: (newOwner: string, onSuccess: () => void) => {
      dispatch(userActions.transferOwnership(shortLink, newOwner, onSuccess))
>>>>>>> user-page-table
    },
  }

  return {
    shortLinkState: shortLink ? urlState : undefined,
    shortLinkDispatch: shortLink ? dispatchOptions : undefined,
  }
}
