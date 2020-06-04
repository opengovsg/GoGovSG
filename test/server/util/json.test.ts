import jsonMessage from '../../../src/server/util/json'
import { MessageType } from '../../../src/shared/util/messages'

describe('jsonMessage tests', () => {
  test('no type', () => {
    expect(jsonMessage('aaaa')).toStrictEqual({
      message: 'aaaa',
      type: undefined,
    })
  })

  test('with type', () => {
    expect(jsonMessage('aaaa', MessageType.FileUploadError)).toStrictEqual({
      message: 'aaaa',
      type: MessageType.FileUploadError,
    })
  })
})
