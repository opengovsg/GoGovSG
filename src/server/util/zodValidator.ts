import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError, type ZodType } from 'zod'

import jsonMessage from './json.js'

type RequestSource = 'body' | 'query' | 'params'

export type ZodValidatorOptions = {
  passError?: boolean
  statusCode?: number
}

function formatIssueMessage(issue: ZodError['issues'][number]): string {
  if (issue.message && !issue.message.startsWith('Invalid input')) {
    return issue.message
  }

  if (issue.code === 'invalid_type') {
    const field = issue.path.map(String).join('.') || 'value'
    if (issue.input === undefined) {
      return `"${field}" is required`
    }
  }

  if (issue.code === 'invalid_value') {
    const field = issue.path.map(String).join('.') || 'value'
    const values = issue.values.map((value) => JSON.stringify(value)).join(', ')
    return `"${field}" must be one of [${values.replace(/"/g, '')}]`
  }

  return issue.message
}

export function formatZodValidationError(error: ZodError): string {
  const messages = error.issues.map(formatIssueMessage)
  return `ValidationError: ${messages.join('. ')}`
}

export function formatZodValidationMessage(error: ZodError): string {
  return error.issues.map(formatIssueMessage).join('. ')
}

function assignValidatedValue(
  req: Request,
  source: RequestSource,
  value: unknown,
): void {
  if (source === 'query') {
    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      value,
      writable: false,
    })
    return
  }

  req[source] = value
}

function createSourceValidator(
  source: RequestSource,
  options: ZodValidatorOptions,
) {
  const { passError = false, statusCode = 400 } = options

  return (schema: ZodType): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[source])
      if (!result.success) {
        const message = formatZodValidationError(result.error)
        if (passError) {
          next({
            error: {
              isZod: true,
              toString: () => message,
              message: formatZodValidationMessage(result.error),
            },
          })
          return
        }
        res.status(statusCode).send(jsonMessage(message))
        return
      }

      assignValidatedValue(req, source, result.data)
      next()
    }
  }
}

export function createValidator(options: ZodValidatorOptions = {}) {
  return {
    body: createSourceValidator('body', options),
    query: createSourceValidator('query', options),
    params: createSourceValidator('params', options),
  }
}
