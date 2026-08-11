import { Request, Response } from 'express'

import assetVariant from '../../shared/util/asset-variant.js'
import { ERROR_404_PATH } from '../constants.js'
import { displayHostname } from '../config.js'
import jsonMessage from './json.js'
import './response.js'

/**
 * Express 5 decodes named path params via decodeURIComponent before route
 * handlers run. Malformed percent-encoding throws URIError into the global
 * error handler. API routes get JSON; redirect traffic gets the short-link
 * HTML 404 page.
 */
export default function handleUriError(req: Request, res: Response): void {
  if (req.path.startsWith('/api/')) {
    res.badRequest(jsonMessage('Malformed URL'))
    return
  }

  const shortUrl = req.path.slice(1)
  res.status(404).render(ERROR_404_PATH, {
    shortUrl,
    assetVariant,
    displayHostname,
  })
}
