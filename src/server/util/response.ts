// Make this a module.
import { response } from 'express'

export {}

/* eslint-disable func-names */
response.ok = function (content) {
  this.status(200).send(content)
}
response.created = function (content) {
  this.status(201).send(content)
}
response.badRequest = function (content) {
  this.status(400).send(content)
}
response.unauthorized = function (content) {
  this.status(401).send(content)
}
response.forbidden = function (content) {
  this.status(403).send(content)
}
response.notFound = function (content) {
  this.status(404).send(content)
}
response.unsupportedMediaType = function (content) {
  this.status(415).send(content)
}
response.unprocessableEntity = function (content) {
  this.status(422).send(content)
}
response.serverError = function (content) {
  this.status(500).send(content)
}
