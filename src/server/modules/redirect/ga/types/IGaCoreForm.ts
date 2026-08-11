import { GaHitVariant } from './enum.js'

export default interface IGaCoreForm {
  v: number // Version.
  tid: string // Tracking ID / Property ID.
  cid: string // Anonymous Client ID.
  t: GaHitVariant // Event hit type.
}
