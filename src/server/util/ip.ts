import Express from 'express'

/**
 * Extract client's IP address. Prioritise Cloudflare's client ip header, with
 * a fallback of req.ip for environments without Cloudflare proxy.
 * @param req
 */
export function getIp(req: Express.Request) {
  return req.get('CF-Connecting-IP') || req.ip
}

export default { getIp }
