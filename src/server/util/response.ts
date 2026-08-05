// Make this a module.
import { response } from 'express'

export {}

/* eslint-disable func-names, @typescript-eslint/no-explicit-any */
response.ok = function (content: Buffer | object | string | undefined) {
  this.status(200).send(content)
}
response.created = function (content: Buffer | object | string | undefined) {
  this.status(201).send(content)
}
;(response as any).badRequest = function (
  content: Buffer | object | string | undefined,
) {
  this.status(400).send(content)
}
;(response as any).unauthorized = function (
  content: Buffer | object | string | undefined,
) {
  this.status(401).send(content)
}
;(response as any).forbidden = function (
  content: Buffer | object | string | undefined,
) {
  this.status(403).send(content)
}
;(response as any).notFound = function (
  content: Buffer | object | string | undefined,
) {
  this.status(404).send(content)
}
;(response as any).unsupportedMediaType = function (
  content: Buffer | object | string | undefined,
) {
  this.status(415).send(content)
}
;(response as any).unprocessableEntity = function (
  content: Buffer | object | string | undefined,
) {
  this.status(422).send(content)
}
;(response as any).serverError = function (
  content: Buffer | object | string | undefined,
) {
  this.status(500).send(content)
}
