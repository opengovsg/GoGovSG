import React from 'react'

import { useSelector } from 'react-redux'
import ToolBar from './ToolBar/index.js'
import UrlTable from './UrlTable/index.js'
import EmptyState from '../EmptyState/index.js'
import { ApplyAppMargins } from '../../../app/components/AppMargins/index.js'
import StatusBar from './StatusBar/index.js'

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
      <StatusBar />
      {!initialised && <div />}
      {initialised &&
        (urlCount > 0 ? <UrlTable /> : <EmptyState urlsFiltered />)}
    </>
  )
}
