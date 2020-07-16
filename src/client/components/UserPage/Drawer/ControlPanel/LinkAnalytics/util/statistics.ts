import { useEffect, useState } from 'react'

import { get } from '../../../../../../util/requests'
import { LinkStatisticsInterface } from '../../../../../../../shared/interfaces/link-statistics'

export type LinkStatistics = {
  status: number | null
  contents: LinkStatisticsInterface | null
}

export const initialState: LinkStatistics = {
  status: null,
  contents: null,
}

export const useStatistics = (shortUrl: string) => {
  const [statistics, setStatistics] = useState<LinkStatistics>(initialState)

  useEffect(() => {
    const fetchStatistics = async () => {
      const endpoint = `/api/link-stats?url=${shortUrl}`
      const response = await get(endpoint)
      const LinkStatistics: LinkStatistics = {
        status: response.status,
        contents: await response.json(),
      }
      setStatistics(LinkStatistics)
    }
    if (shortUrl) {
      fetchStatistics()
    }
  }, [])

  return statistics
}
