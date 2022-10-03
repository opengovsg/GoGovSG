// eslint-disable-next-line import/no-unresolved
import http from 'k6/http'
// eslint-disable-next-line import/no-unresolved
import { sleep } from 'k6'

/**
 * This script performs a load test on our servers for roughly 1 minute
 * and displays some relevant performance metrics from the test.
 *
 * Setup:
 * Ensure that `k6` is installed on your local machine, using e.g. `brew install k6` on MacOS.
 * (Note that there is no npm package for k6, as the module is not written in JavaScript.).
 *
 * Instructions:
 * Configure `NUM_VUS` and `URL` accordingly for the load test.
 * The QPS on the given URL will be roughly equal to (but a little smaller than) `NUM_VUS`.
 * Run this script using `k6 run load-test.js`.
 */

const NUM_VUS = 10
const URL = 'https://staging.go.gov.sg/invalidurl2'

export const options = {
  vus: NUM_VUS,
  iterations: 60 * NUM_VUS,
  // duration: '30s',
}

export default function vu() {
  http.get(URL, {
    tags: { name: 'StagingShortLink' }, // Use URL grouping to avoid creating metrics for the same URL
  })
  sleep(1)
}
