import IGaCoreForm from './IGaCoreForm'

export default interface IGaPageViewForm extends IGaCoreForm {
  ds: string // Data source.
  dp: string // Document path.
  dt: string // Document title.
  uip?: string // IP override.
  ua?: string // User agent override.
  dh?: string // Document host name.
  dr?: string // Document referrer.
  ul?: string
}
