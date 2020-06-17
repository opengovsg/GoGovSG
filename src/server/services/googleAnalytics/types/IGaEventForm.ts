import { EventCategory } from 'aws-sdk/clients/cloudtrail'
import IGaCoreForm from './IGaCoreForm'
import { EventAction } from './enum'

export default interface IGaEventForm extends IGaCoreForm {
  ec: EventCategory // Event Category. Required.
  ea: EventAction // Event Action. Required.
  el?: string // Event label.
  ev?: string // Event value.
}
