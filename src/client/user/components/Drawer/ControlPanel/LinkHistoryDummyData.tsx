export type LinkChangeType = 'create' | 'update'

export type LinkChangeKey =
  | 'description'
  | 'isFile'
  | 'state'
  | 'userEmail'
  | 'longUrl'

export interface LinkChangeSet {
  type: LinkChangeType
  key: LinkChangeKey
  prevValue: string | boolean
  currValue: string | boolean
  updatedAt: string
}
export const changeSets = [
  {
    type: 'update',
    key: 'state',
    prevValue: 'InActive',
    currValue: 'Active',
    updatedAt: '2022-10-01T13:31:39.419Z',
  },
  {
    type: 'update',
    key: 'userEmail',
    prevValue: 'alexis@open.gov.sg',
    currValue: 'jim@open.gov.sg',
    updatedAt: '2022-10-01T13:31:39.419Z',
  },
  {
    type: 'update',
    key: 'userEmail',
    prevValue: 'jim@open.gov.sg',
    currValue: 'alexis@open.gov.sg',
    updatedAt: '2022-10-01T13:31:39.419Z',
  },
  {
    type: 'update',
    key: 'state',
    prevValue: 'Active',
    currValue: 'InActive',
    updatedAt: '2022-10-01T13:31:39.419Z',
  },
  {
    type: 'update',
    key: 'longUrl',
    prevValue: 'https://abc.com',
    currValue: 'https://google.com',
    updatedAt: '2022-10-01T13:31:39.419Z',
  },
  {
    type: 'create',
    key: 'longUrl',
    prevValue: '',
    currValue: 'https://abc.com',
    updatedAt: '2022-08-05T11:57:41.309Z',
  },
] as LinkChangeSet[]
export const defaultSet = [
  {
    type: 'create',
    key: 'longUrl',
    prevValue: '',
    currValue: 'https://abc.com',
    updatedAt: '2022-08-05T11:57:41.309Z',
  },
] as LinkChangeSet[]
