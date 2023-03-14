import fetch from 'cross-fetch'
import FormData from 'form-data'

export const postJson = (url: string, data: object, authCookie?: string) => {
  const opts: RequestInit = {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authCookie && { Cookie: authCookie }),
    },
    body: JSON.stringify(data),
  }
  return fetch(url, opts)
}

export const postFormData = (
  url: string,
  data: FormData,
  authCookie?: string,
) => {
  const opts: RequestInit = {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      ...(authCookie && { Cookie: authCookie }),
    },
    body: data as any, // Circumvent typescript error where form-data cannot be used as request body
  }
  return fetch(url, opts)
}

export const patch = (url: string, data: object, authCookie?: string) => {
  const opts: RequestInit = {
    method: 'PATCH',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authCookie && { Cookie: authCookie }),
    },
    body: JSON.stringify(data),
  }
  return fetch(url, opts)
}

export const patchFormData = (
  url: string,
  data: FormData,
  authCookie?: string,
) => {
  const opts: RequestInit = {
    method: 'PATCH',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      ...(authCookie && { Cookie: authCookie }),
    },
    body: data as any, // Circumvent typescript error where form-data cannot be used as request body
  }
  return fetch(url, opts)
}

export const get = (url: string, authCookie?: string) => {
  const opts: RequestInit = {
    method: 'GET',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      ...(authCookie && { Cookie: authCookie }),
    },
  }
  return fetch(url, opts)
}
