import React from 'react'

import ToolBar from './ToolBar'
import UrlTable from './UrlTable'
import { ApplyAppMargins } from '../../AppMargins'

export default function UserLinkTable() {
  return (
    <>
      <ApplyAppMargins>
        <ToolBar />
      </ApplyAppMargins>
      <UrlTable />
    </>
  )
}
