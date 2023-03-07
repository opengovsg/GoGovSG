import './util/tracing' // This is import has to be placed at the top for Tracing to work properly
import 'reflect-metadata' // This import has to be placed at the top level for Dependency Injection
import path from 'path'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import cookieSession from 'cookie-session'
import connectRedis from 'connect-redis'
import jsonMessage from './util/json'
import bindInversifyDependencies from './inversify.config'

// Happens at the top so all imports will have
// properly-bound containers
bindInversifyDependencies()

// Routes
import api from './api'

// Logger configuration
import {
  cookieSettings,
  cspOnlyReportViolations,
  cspReportUri,
  displayHostname,
  logger,
  port,
  s3Bucket,
  sentryDns,
  sessionSettings,
  trustProxy,
} from './config'

// Services
const SessionStore = connectRedis(session)
import { sessionClient } from './redis'
import initDb from './models'

// Helper static methods attached to http.ServerResponse class
// to return appropriate status codes in readable manner
import './util/response'

// Morgan configuration for logging HTTP requests
import getIp from './util/request'
import { container } from './util/inversify'
import { DependencyIds, ERROR_404_PATH } from './constants'
import { Mailer } from './services/email'
import parseDomain from './util/domain'
import { RedirectController } from './modules/redirect'
import assetVariant from '../shared/util/asset-variant'
// Define our own token for client ip
// req.headers['cf-connecting-ip'] : Cloudflare

// req.ip : Contains the remote IP address of the request.
// If trust proxy setting is true,
// the value of this property is derived from the left-most entry in the X-Forwarded-For header.
// This header can be set by the client or by the proxy.
// If trust proxy setting is false, the app is understood as directly facing the Internet
// and the client’s IP address is derived from req.connection.remoteAddress.
morgan.token('client-ip', (req: express.Request) => getIp(req) as string)
morgan.token(
  'redirectUrl',
  (_: express.Request, res: express.Response): string =>
    res.statusCode === 302 ? (res.getHeader('location') as string) : '',
)
morgan.token('userId', (req: express.Request) =>
  req.session && req.session.user && req.session.user.id
    ? String(req.session.user.id)
    : '',
)

const MORGAN_LOG_FORMAT =
  ':client-ip - ":method :url HTTP/:http-version" :status ' +
  '":redirectUrl" ":userId" :res[content-length] ":referrer" ":user-agent" :response-time ms'

const morganOutputStream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

const connectSrc = [
  "'self'",
  'https://www.google-analytics.com/',
  'https://stats.g.doubleclick.net/',
  'https://*.browser-intake-datadoghq.com/',
]
if (cspReportUri) {
  connectSrc.push(parseDomain(cspReportUri))
}
if (sentryDns) {
  connectSrc.push(parseDomain(sentryDns))
}

const app = express()
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com/',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com/'],
        imgSrc: [
          "'self'",
          'data:',
          'https://www.google-analytics.com/',
          'https://www.googletagmanager.com/',
          'https://stats.g.doubleclick.net/',
          `https://${s3Bucket}/`,
        ],
        scriptSrc: [
          "'self'",
          'https://www.google-analytics.com/',
          'https://ssl.google-analytics.com/',
          'https://www.googletagmanager.com/',
          'https://*.browser-intake-datadoghq.com/',
          'https://www.datadoghq-browser-agent.com/',
        ],
        workerSrc: ['blob:'],
        connectSrc,
        frameAncestors: ["'self'"],
        ...(cspReportUri ? { reportUri: cspReportUri } : {}),
        upgradeInsecureRequests: [],
      },
      reportOnly: cspOnlyReportViolations,
    },
  }),
)

initDb()
  .then(() => {
    logger.info('Database initialised.')

    // Initialise nodemailer
    container.get<Mailer>(DependencyIds.mailer).initMailer()

    // Site-wide cache control
    app.use((_, res, next) => {
      res.header('Cache-Control', 'no-store')
      next()
    })

    // To serve from build
    app.use(express.static('dist'))
    app.use(express.static('public'))

    if (trustProxy) {
      app.set('trust proxy', trustProxy)
    }

    app.set('views', path.resolve(__dirname, './views'))
    app.set('view engine', 'ejs')

    const apiSpecificMiddleware = [
      // Sessions
      session({
        store: new SessionStore({
          client: sessionClient, // ttl defaults to session.cookie.maxAge
          logErrors: true,
        }),
        resave: false, // can set to false since touch is implemented by our store
        saveUninitialized: false, // do not save new sessions that have not been modified
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
          ...cookieSettings,
        },
        ...sessionSettings,
      } as session.SessionOptions),
      // application/json
      bodyParser.json(),
    ]

    const redirectSpecificMiddleware = [
      cookieSession({
        name: 'visits',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secret: sessionSettings.secret,
      }),
    ]

    // Log http requests
    app.use(morgan(MORGAN_LOG_FORMAT, { stream: morganOutputStream }))

    const redirectController = container.get<RedirectController>(
      DependencyIds.redirectController,
    )

    // API configuration
    app.use('/api', ...apiSpecificMiddleware, api) // Attach all API endpoints
    app.get(
      '/assets/transition-page/js/redirect.js',
      redirectController.gtagForTransitionPage,
    )
    app.get(
      '/:shortUrl([a-zA-Z0-9-]+).?',
      ...redirectSpecificMiddleware,
      redirectController.redirect,
    ) // The Redirect Endpoint
    app.use((req, res) => {
      const shortUrl = req.path.slice(1)
      res.status(404).render(ERROR_404_PATH, {
        shortUrl,
        assetVariant,
        displayHostname,
      })
      return
    })

    const errorHandler: express.ErrorRequestHandler = (
      err,
      _req,
      res,
      _next,
    ) => {
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

      res.status(500).render('500.error.ejs')
      return
    }
    app.use(errorHandler)

    // const port = 8080
    app.listen(port, () => logger.info(`Listening on port ${port}!`))
  })
  .catch((error: any) => {
    logger.error(`Initialisation error:\t${error}`)
    process.exit(1)
  })
