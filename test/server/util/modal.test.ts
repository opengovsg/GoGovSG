import { parseAnnouncementString } from '../../../src/server/util/modal'

describe('parseAnnouncementString', () => {
  it('has all undefined for undefined', () => {
    expect(parseAnnouncementString(undefined)).toStrictEqual({
      message: undefined,
      title: undefined,
      subtitle: undefined,
      url: undefined,
      image: undefined,
    })
  })

  it('has all undefined message for blank', () => {
    expect(parseAnnouncementString('')).toStrictEqual({
      message: undefined,
      title: undefined,
      subtitle: undefined,
      url: undefined,
      image: undefined,
    })
  })

  it('has only message for message', () => {
    expect(parseAnnouncementString('message')).toStrictEqual({
      message: 'message',
      title: undefined,
      subtitle: undefined,
      url: undefined,
      image: undefined,
    })
  })

  it('has blank url and subtitle if not specified but image specified', () => {
    expect(
      parseAnnouncementString('message;title;;;/favicon.ico'),
    ).toStrictEqual({
      message: 'message',
      title: 'title',
      subtitle: '',
      url: '',
      image: '/favicon.ico',
    })
  })

  it('has fields populated if fields populated', () => {
    expect(
      parseAnnouncementString(
        'message;title;subtitle;https://go.gov.sg/;/favicon.ico',
      ),
    ).toStrictEqual({
      message: 'message',
      title: 'title',
      subtitle: 'subtitle',
      url: 'https://go.gov.sg/',
      image: '/favicon.ico',
    })
  })
})
