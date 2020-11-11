import ReactGA from 'react-ga'
import { get } from './requests'

// Checks if reactga has initalised
let hasInit = false

const getGaId = async () => {
  await get('/api/ga').then(async (response) => {
    if (response.ok) {
      await response.text().then((gaid) => {
        ReactGA.initialize(gaid)
        hasInit = true
      })
    }
  })
}
/**
 * Send GA Event to record click - customise the category, action and label name to record multiple uniques per session.
 * @param {string} category
 * @param {string} action
 * @param {string} [label='nothing']
 */
export const GAEvent = async (
  category: string,
  action: string,
  label: string = 'nothing',
) => {
  if (!hasInit) {
    await getGaId()
  }
  ReactGA.event({
    category, // Required
    action, // Required
    label,
    value: 10,
    nonInteraction: false,
  })
}
/**
 * Send GA Pageview to record time on page - once per session.
 * @param {string} page
 * @param {string} [title=undefined]
 */
export const GAPageView = async (page: string, title?: string) => {
  if (!hasInit) {
    await getGaId()
  }
  ReactGA.pageview(page, undefined, title)
}
