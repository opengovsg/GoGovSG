import tracer, { Span } from 'dd-trace'
import type { Request } from 'express'
import { ClientRequest, IncomingMessage, ServerResponse } from 'http'

tracer.init({
  profiling: true,
  logInjection: true,
  runtimeMetrics: true,
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
tracer.use('express', {
  hooks: {
    request: (
      span: Span | undefined,
      req: IncomingMessage | undefined,
      _: ServerResponse | undefined,
    ) => {
      // Lets latency SLOs exclude file uploads, which wait on a multi-second virus scan
      span?.setTag(
        'go.is_file',
        (req as Request | undefined)?.files?.file ? 'true' : 'false',
      )
    },
  },
})

export default tracer
