import request from 'supertest'
import png from 'upng-js'
import jsQR from 'jsqr'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { OtpRepositoryMock } from '../mocks/repositories/OtpRepository'
import {
  Cryptography,
  OtpRepository,
} from '../../../src/server/modules/auth/interfaces'
import CryptographyMock from '../mocks/services/cryptography'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { MockUserRepository } from '../mocks/repositories/UserRepository'

// Mocked up bindings
container.bind<OtpRepository>(DependencyIds.otpRepository).to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)

// Importing setup app
import app from './setup'

describe('GET /api/qrcode', () => {
  test('return a qrcode', async (done) => {
    const ogUrl = 'undefined'
    const url = 'random'
    const format = 'image%2Fpng'
    const query = `/api/qrcode?url=${url}&format=${format}`

    const res = await request(app).get(query).set('prime', '1')
    expect(res.status).toBe(200)
    const data = png.decode(res.body)
    const out = {
      data: new Uint8ClampedArray(png.toRGBA8(data)[0]),
      height: data.height,
      width: data.width,
    }
    const code = jsQR(out.data, out.width, out.height)
    expect(code).not.toBeNull()
    expect(code!.data).toEqual(`${ogUrl}/${url}`)
    done()
  })
})
