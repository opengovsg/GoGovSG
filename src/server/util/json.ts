import { MessageType } from '../../shared/util/messages.js'

/**
 * Wraps a string in an object with 'message' field.
 */
export default (message: string, type?: MessageType) => ({ message, type })
