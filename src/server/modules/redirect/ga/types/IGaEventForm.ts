import { EventAction, EventCategory } from './enum'
import IGaCoreForm from './IGaCoreForm'

export default interface IGaEventForm extends IGaCoreForm {
  ec: EventCategory // Event Category. Required.
  ea: EventAction // Event Action. Required.
  el?: string // Event label.
  ev?: string // Event value.
}
