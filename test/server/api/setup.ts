import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import { MailerMock } from '../mocks/services/email'
import {
  clicksModelMock,
  devicesModelMock,
  heatMapModelMock,
  mockDefine,
  mockQuery,
  mockTransaction,
  redisMockClient,
  urlClicksModelMock,
  urlModelMock,
  userModelMock,
} from './util'
import bindInversifyDependencies from '../../../src/server/inversify.config'

// Bind all defaults (after the mocks have been binded)
bindInversifyDependencies()

// Import testing Routes
import api from '../../../src/server/api'

const app = express()
app.use(bodyParser.json())

// Preset response
function presetResponse(_: Request, res: Response, next: NextFunction): void {
  res.ok = function resOkay(msg) {
    this.status(200).send(msg)
  }
  res.serverError = function resServerError(msg) {
    this.status(500).send(msg)
  }
  next()
}

// attach - Preset response
app.use(presetResponse)

// attach - Mocked session
app.use(
  session({
    name: 'gogovsg',
    secret: 'notsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1800000,
    },
  }),
)

// prime mock
function primeMock(req: Request, _: Response, next: NextFunction): void {
  if (typeof req.headers.prime === 'string') {
    req.session!.user = {
      id: Number(req.headers.prime),
      email: 'hello@open.gov.sg',
    }
  }
  next()
}

// attach - prime mock session as required - bypass userGuard session
app.use(primeMock)

// attach -  Routes to be tested
app.use('/api', api)

// Redis Mock
jest.mock('../../../src/server/redis', () => ({
  otpClient: redisMockClient,
}))

// Temporary sequelize mock - the goal would be to have a real sequalize instance used here
jest.mock('../../../src/server/util/sequelize', () => ({
  transaction: mockTransaction,
  sequelize: {
    query: mockQuery,
    transaction: mockTransaction,
    define: mockDefine,
  },
}))

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/models/statistics/clicks', () => ({
  UrlClicks: urlClicksModelMock,
}))

// Necessary mock for app to work
jest.mock('../../../src/server/models/statistics/daily', () => ({
  DailyClicks: clicksModelMock,
}))

// Necessary mock for app to work
jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

// Necessary mock for app to work
jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

// Necessary mock for app to work
jest.mock('../../../src/server/services/email', () => ({
  MailerNode: MailerMock,
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

export default app
