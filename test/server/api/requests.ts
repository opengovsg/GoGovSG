import axios from 'axios'

const baseUrl = 'http://localhost:3000'

export const get = (url: string) => {
  const targetUrl = `${baseUrl}${url}`
  return axios.get(targetUrl).catch((err) => {
    return err
  })
}

export const post = (url: string, body: object) => {
  const targetUrl = `${baseUrl}${url}`
  return axios.post(targetUrl, body).catch((err) => {
    return err
  })
}

export const getWithCookie = (url: string, cookie: object) => {
  const targetUrl = `${baseUrl}${url}`

  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cache: 'no-cache',
      cookie,
    },
  }

  return axios.get(targetUrl, config).catch((err) => {
    return err
  })
}

export const postWithCookie = (
  url: string,
  cookie: object,
  payload: object,
) => {
  const targetUrl = `${baseUrl}${url}`

  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cache: 'no-cache',
      cookie,
    },
  }

  return axios.post(targetUrl, payload, config).catch((err) => {
    return err
  })
}
