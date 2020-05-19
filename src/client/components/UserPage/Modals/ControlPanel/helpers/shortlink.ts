import { useDispatch, useSelector } from 'react-redux'

import userActions from '../../../../../actions/user'

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
  (
    | {
        toggleStatus: () => (dispatch: any) => void
      }
    | undefined
  ),
]

export default function useShortLink(shortLink: string): ShortLinkState {
  const urls: LinkState[] = useSelector((state: any) => state.user.urls)
  const urlState = urls.filter(
    (url: LinkState) => url.shortUrl === shortLink,
  )[0]
  const dispatch = useDispatch()
  const dispatchOptions = {
    toggleStatus: () => dispatch(userActions.toggleUrlState(urlState.shortUrl, urlState.state)),
  }
  if (shortLink) {
    return [urlState, dispatchOptions]
  }
  return [undefined, undefined]
}
