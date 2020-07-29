// Make this a module.
import http from 'http'

export {}

/* eslint-disable func-names */
http.ServerResponse.prototype.ok = function (content) {
  this.status(200).send(content)
}
http.ServerResponse.prototype.created = function (content) {
  this.status(201).send(content)
}
http.ServerResponse.prototype.badRequest = function (content) {
  this.status(400).send(content)
}
http.ServerResponse.prototype.unauthorized = function (content) {
  this.status(401).send(content)
}
http.ServerResponse.prototype.notFound = function (content) {
  this.status(404).send(content)
}
http.ServerResponse.prototype.unsupportedMediaType = function (content) {
  this.status(415).send(content)
}
http.ServerResponse.prototype.unprocessableEntity = function (content) {
  this.status(422).send(content)
}
http.ServerResponse.prototype.serverError = function (content) {
  this.status(500).send(content)
}
