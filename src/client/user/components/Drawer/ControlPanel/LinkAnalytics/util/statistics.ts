import { useEffect, useState } from 'react'

import { get } from '../../../../../../app/util/requests.js'
import { LinkStatistics } from '../../../../../../../shared/interfaces/link-statistics.js'
import { GAEvent } from '../../../../../../app/util/ga.js'

export type LinkStatisticsState = {
  status: number | null
  contents: LinkStatistics | null
}

export const initialState: LinkStatisticsState = {
  status: null,
  contents: null,
}

export const useStatistics = (shortUrl: string) => {
  const [statistics, setStatistics] =
    useState<LinkStatisticsState>(initialState)

  useEffect(() => {
    const fetchStatistics = async () => {
      const endpoint = `/api/link-stats?url=${shortUrl}`
      const response = await get(endpoint)

      if (response.status !== 200) {
        GAEvent(
          'drawer page analytics data',
          'fetch analytics data',
          'unsuccessful',
        )
      }

      const linkStatistics: LinkStatisticsState = {
        status: response.status,
        contents: await response.json(),
      }
      setStatistics(linkStatistics)
    }
    if (shortUrl) {
      fetchStatistics()
    }
  }, [])

  return statistics
}
