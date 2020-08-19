import Express from 'express'

/**
 * Extract client's IP address. Prioritise Cloudflare's client ip header, with
 * a fallback of req.ip for environments without a Cloudflare proxy.
 * @param req Express request.
 */
export function getIp(req: Express.Request) {
  return req.get('CF-Connecting-IP') || req.ip
}

export default { getIp }
