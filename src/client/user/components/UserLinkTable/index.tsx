import React from 'react'

import ToolBar from './ToolBar'
import UrlTable from './UrlTable'
import EmptyState from '../EmptyState'
import { ApplyAppMargins } from '../../../app/components/AppMargins'
import { useSelector } from 'react-redux'

export default function UserLinkTable() {
  const initialised = useSelector((state: any) => {
    return state.user.initialised
  })
  const urlCount = useSelector((state: any) => {
    return state.user.urlCount
  })

  return (
    <>
      <ApplyAppMargins>
        <ToolBar />
      </ApplyAppMargins>
      {!initialised && <div />}
      {initialised &&
        (urlCount > 0 ? <UrlTable /> : <EmptyState urlsFiltered />)}
    </>
  )
}
