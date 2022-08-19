import { injectable } from 'inversify'
import _ from 'lodash'

import { UrlHistory, UrlHistoryType } from '../../../models/url'
import { User, UserType } from '../../../models/user'
import * as interfaces from '../interfaces'

type UrlAuditHistoryType = UrlHistoryType & {
  user: UserType
}

@injectable()
export class UrlHistoryRepository implements interfaces.UrlHistoryRepository {
  public findByShortUrl: (
    shortUrl: string,
    limit: number,
    offset: number,
  ) => Promise<interfaces.UrlHistoryRecord[]> = async (
    shortUrl,
    limit,
    offset,
  ) => {
    const urlHistories = (await UrlHistory.findAll({
      include: [{ model: User }],
      order: [['updatedAt', 'DESC']],
      raw: true,
      nest: true,
      offset,
      limit,
      where: { urlShortUrl: shortUrl },
    })) as UrlAuditHistoryType[]

    return urlHistories.map((urlHistory) => {
      return {
        longUrl: urlHistory.longUrl,
        state: urlHistory.state,
        shortUrl: urlHistory.urlShortUrl,
        createdAt: urlHistory.createdAt,
        userEmail: urlHistory.user.email,
        description: urlHistory.description,
        isFile: urlHistory.isFile,
      }
    })
  }

  public getCountByShortUrl: (shortUrl: string) => Promise<number> = async (
    shortUrl,
  ) => {
    return UrlHistory.count({ where: { urlShortUrl: shortUrl } })
  }
}

export default UrlHistoryRepository
