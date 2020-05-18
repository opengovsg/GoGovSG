import 'reflect-metadata' // This import has to be placed at the top level for Dependency Injection
import path from 'path'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import cookieSession from 'cookie-session'
import connectRedis from 'connect-redis'
import fileUpload from 'express-fileupload'
import bindInversifyDependencies from './inversify.config'

// Routes
import api from './api'
import redirect from './api/redirect'

// Logger configuration
import { cookieSettings, logger, sessionSettings, trustProxy } from './config'

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
import { DependencyIds } from './constants'
import { Mailer } from './util/email'
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
    ? (req.session.user.id as string)
    : '',
)

const MORGAN_LOG_FORMAT =
  ':client-ip - [:date[clf]] ":method :url HTTP/:http-version" :status ' +
  '":redirectUrl" ":userId" :res[content-length] ":referrer" ":user-agent" :response-time ms'

const app = express()
app.use(helmet())
bindInversifyDependencies()
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
          ...cookieSettings,
        },
        ...sessionSettings,
      } as session.SessionOptions),
      // application/x-www-form-urlencoded
      bodyParser.urlencoded({ extended: false }),
      // application/json
      bodyParser.json(),
      // multipart/form-data
      fileUpload(),
    ]

    const redirectSpecificMiddleware = [
      cookieSession({
        name: 'visits',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secret: sessionSettings.secret,
      }),
    ]

    // Log http requests
    app.use(morgan(MORGAN_LOG_FORMAT))

    // API configuration
    app.use((_, res, next) => {
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH')
      next()
    })
    app.use('/api', ...apiSpecificMiddleware, api) // Attach all API endpoints
    app.use(
      '/:shortUrl([a-zA-Z0-9-]+)',
      ...redirectSpecificMiddleware,
      redirect,
    ) // The Redirect Endpoint
    app.use((req, res) => {
      const shortUrl = req.path.slice(1)
      res.status(404).render('404.error.ejs', { shortUrl })
    })

    const errorHandler: express.ErrorRequestHandler = (
      _err,
      _req,
      res,
      _next,
    ) => {
      res.status(500).render('500.error.ejs')
    }
    app.use(errorHandler)

    const port = 8080
    app.listen(port, () => logger.info(`Listening on port ${port}!`))
  })
  .catch((error: any) => {
    logger.error(`Initialisation error:\t${error}`)
    process.exit(1)
  })
