const fetch = require('cross-fetch')

const postJson = (url = '', data = {}, options) => {
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

  return fetch(url, opts)
}

const patch = (url = '', data = {}, options) => {
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

  return fetch(url, opts)
}

const get = (url, options) => {
  const opts = options || {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
  }

  return fetch(url, opts)
}

module.exports = {
  postJson,
  get,
  patch,
}
