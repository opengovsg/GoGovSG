declare module 'nodemailer' {
  interface TransporterCredentials {
    user: string
    pass: string
  }

  interface TransporterOptions {
    host: string
    port: string
    auth: TransporterCredentials
    pool: boolean
    maxMessages: number
    maxConnections: number
  }

  interface MailOptions {
    to: string
    from: string
    subject: string
    html: string
  }

  interface Transport {
    sendMail(mail: MailOptions, callback?: (err: Error) => void): void
  }
  function createTransport(config: TransporterOptions): Transport
}
