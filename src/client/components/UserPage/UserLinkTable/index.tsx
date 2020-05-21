import React from 'react'

import ToolBar from './ToolBar'
import UrlTable from './UrlTable'
import EmptyState from '../EmptyState'
import { ApplyAppMargins } from '../../AppMargins'
import { useSelector } from 'react-redux'

export default function UserLinkTable() {
  const urlCount = useSelector((state: any) => {
    return state.user.urlCount
  })

  return (
    <>
      <ApplyAppMargins>
        <ToolBar />
      </ApplyAppMargins>
      {urlCount > 0 ? <UrlTable /> : <EmptyState urlsFiltered />}
    </>
  )
}
