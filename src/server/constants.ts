export const DependencyIds = {
  urlRepository: Symbol.for('urlRepository'),
  urlMapper: Symbol.for('urlMapper'),
  userMapper: Symbol.for('userMapper'),
  analyticsLogging: Symbol.for('aLogging'),
  cookieReducer: Symbol.for('cookieReducer'),
  userRepository: Symbol.for('userRepository'),
  otpCache: Symbol.for('otpCache'),
  mailer: Symbol.for('mailer'),
  cryptography: Symbol.for('cryptography'),
  s3: Symbol.for('s3'),
  s3Bucket: Symbol.for('s3Bucket'),
  s3Client: Symbol.for('s3Client'),
  fileURLPrefix: Symbol.for('fileURLPrefix'),
}

export default DependencyIds
