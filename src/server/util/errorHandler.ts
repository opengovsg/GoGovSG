import express from 'express'

import handleUriError from './handleUriError.js'
import jsonMessage from './json.js'
import './response.js'

const errorHandler: express.ErrorRequestHandler = (err, req, res, _next) => {
  // Catch Joi validation errors and pass them as properly-formatted
  // messages.
  if (err?.error?.isJoi) {
    res.badRequest(jsonMessage(err.error.toString()))
    return
  }

  if (
    err.statusCode === 400 &&
    'body' in err &&
    err.type === 'entity.parse.failed'
  ) {
    // This catches body-parser errors and returns a 400 error message
    console.error(err)
    res.badRequest(jsonMessage('Bad Request. JSON is malformed'))
    return
  }

  if (err instanceof URIError) {
    handleUriError(req, res)
    return
  }

  res.status(500).render('500.error.ejs')
  return
}

export default errorHandler
