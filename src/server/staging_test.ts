import fetch from 'cross-fetch'

const BASE_URL = 'https://staging.go.gov.sg/api'
const COOKIE =
  'gogovsg=s%3AwC3bLlXRHzBCjfxjMWIifZvrEnVno7_d.dbrZHdyxnpsJkIAIHbU2dOplkCjyvdslEl%2B4zTi5xMs;'

// const getUrls = async (baseUrl = BASE_URL, cookie = COOKIE) => {
//   const res = await fetch(
//     `${baseUrl}/user/url?limit=10&offset=0&orderBy=createdAt&sortDirection=desc&searchText=`,
//     {
//       method: 'GET',
//       credentials: 'same-origin',
//       headers: {
//         Cookie: cookie,
//       },
//     },
//   )
//   if (res.ok) {
//     console.log(res)
//     console.log('success')
//   } else {
//     throw new Error('something went wrong')
//   }
// }

const createBulk = async (baseUrl = BASE_URL, cookie = COOKIE) => {
  const res = await fetch(`${baseUrl}/user/url/bulk-performance-test`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: 64, tags: ['tag1', 'tag2'] }),
  })
  if (res.ok) {
    // console.log(res)
    console.log('success')
  } else {
    throw new Error('something went wrong')
  }
}

const concurrentlyRun = async (numTimes: number, funcToRun: () => {}) => {
  const numTimesArr = Array(numTimes).fill(1)
  const startTime = Date.now()
  await Promise.all(numTimesArr.map((_) => funcToRun()))
  const endTime = Date.now()
  console.log(`took ${endTime - startTime} to run`)
}

concurrentlyRun(10, createBulk)
