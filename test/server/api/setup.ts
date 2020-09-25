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
  res.ok = function (msg) {
    this.status(200).send(msg)
  }
  res.serverError = function (msg) {
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
  if (req.headers.prime) {
    req.session!.user = { id: req.headers.prime }
  }
  next()
}

// attach - prime mock session as required - bypass userGuard session
app.use(primeMock)

// attach -  Routes to be tested
app.use('/api', api)

// Redis Mocks
jest.mock('../../../src/server/redis', () => ({
  otpClient: redisMockClient,
}))

// Sequelize Mocks
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

// Necessary mocks for app to work
jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

// Necessary mocks for app to work
jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

// Necessary mocks for app to work
jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

// Necessary mocks for app to work
jest.mock('../../../src/server/services/email', () => ({
  MailerNode: MailerMock,
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

export default app
