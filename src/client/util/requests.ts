import crossFetch from 'cross-fetch'

export const postJson = (
  url: string = '',
  data: object = {},
  options?: RequestInit,
) => {
  const opts = options || {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }
  return crossFetch(url, opts)
}

export const postFormData = (
  url: string,
  data: FormData,
  options?: RequestInit,
) => {
  const opts = options || {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    body: data,
  }
  return crossFetch(url, opts)
}

export const patch = (
  url: string = '',
  data: object = {},
  options?: RequestInit,
) => {
  const opts = options || {
    method: 'PATCH',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }

  return crossFetch(url, opts)
}

export const get = (url: string, options?: RequestInit) => {
  const opts = options || {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
  }

  return crossFetch(url, opts)
}
