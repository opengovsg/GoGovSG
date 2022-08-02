import tracer from 'dd-trace'
import { ClientRequest, IncomingMessage } from 'http'
import { Span } from 'opentracing'
import assetVariant from '../../shared/util/asset-variant'

tracer.init({
  logInjection: true,
  service: `go-${assetVariant}-${process.env.DD_ENV}`,
})
tracer.use('http', {
  client: {
    hooks: {
      request: (
        span: Span | undefined,
        req: ClientRequest | undefined,
        _: IncomingMessage | undefined,
      ) => {
        span?.setTag('resource.name', `${req?.method} ${req?.host}${req?.path}`)
      },
    },
  },
})
