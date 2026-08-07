export const testEmail = 'testcafe@open.gov.sg'
export const transferEmail = 'transfer@open.gov.sg'
export const incorrectEmail = 'testcafe@hotmail.com'
export const incorrectOtp = '222222'
export const shortUrl = 'google.com'
export const subUrl = 'example.com'
export const invalidShortUrl = 'bit.ly'
export const circularRedirectUrl = 'go.gov.sg/test'
export const tagText1 = 'tag_1'
export const tagText2 = 'TAG-2'
export const tagText3 = 'fooBAR123'
// Single origin: the suite is served the prebuilt bundle by Express itself
// rather than by webpack-dev-server on :3000, which also removes the
// dev-server's proxy hop from every request. Both names are kept because the
// specs read differently depending on whether they mean "the app" or "the
// short-link API", and in production these are one origin too.
export const rootLocation = 'http://localhost:8080'
export const apiLocation = 'http://localhost:8080'
export const otp = '111111'
export const dummyMaliciousFilePath = './test/end-to-end/eicar.com.txt'
export const dummyFilePath = './test/end-to-end/anotherDummy.txt'
export const dummyChangedFilePath = './test/end-to-end/changedDummy.csv'
export const dummyBulkCsv = './test/end-to-end/bulkCsv.csv'
export const smallFileSize = 1024 * 1024 * 1
export const largeFileSize = 1024 * 1024 * 21
