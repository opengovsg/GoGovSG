import ReactGA from 'react-ga'
import { get } from '../../util/requests'

// Checks if reactga has initalised
let hasInit = false

const getGaId = async () => {
    await get('/api/ga').then(async (response) => {
      if(response.ok) {
        await response.text().then((gaid) => {
            ReactGA.initialize(gaid)
            hasInit = true
        })
      }
    })
  }
// Records clicks - customise action and label name to record multiple uniques per session
export const GAevent = async (categoryName:string, eventName:string, label?: string| undefined) => {
    if (!hasInit) {
        await getGaId()
    }
    ReactGA.event({       
        category: categoryName,  // Required
        action: eventName,       // Required
        label: label || 'nothing',       
        value: 10,       
        nonInteraction: false     
    }); 
}

// Records clicks and time on page - once per session
export const GApageView = async (page:string, title?:string) => {   
    if (!hasInit) {
        await getGaId()
    }
    ReactGA.pageview(page, undefined ,title);  
}