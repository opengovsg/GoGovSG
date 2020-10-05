export function parseAnnouncementString(
  announcementString?: string,
): {
  message?: string
  title?: string
  subtitle?: string
  url?: string
  image?: string
} {
  if (!announcementString) {
    return {
      message: undefined,
      title: undefined,
      subtitle: undefined,
      url: undefined,
      image: undefined,
    }
  }
  const [message, title, subtitle, url, image] = (
    announcementString || ''
  ).split(';')
  return { message, title, subtitle, url, image }
}

export default {
  parseAnnouncementString,
}
