import { getWithCookie, post } from './requests'

describe('GET: /api/user/url', () => {
  it('positive test: Should return empty url and pass', async (done) => {
    const email = 'urlgo.gov@open.gov.sg'
    const otp = '111111'

    const opts = {
      email,
    }

    const verifyOpts = {
      email,
      otp,
    }

    const setOtp = await post('/api/login/otp', opts)
    expect(setOtp.status).toBe(200) // stored
    const res = await post('/api/login/verify', verifyOpts)
    expect(res.status).toBe(200)
    expect(res.data.message).toBe('OTP hash verification ok.')
    const isLoggedInRes = await getWithCookie(
      '/api/user/url',
      res.headers['set-cookie'],
    )
    expect(isLoggedInRes.status).toBe(200)
    done()
  })
})

// To be worked on

// describe('POST: /api/user/url', () => {

//     it('positive test: Creating brand new short url from a long url', async done => {

//         const email= "go.gov@open.gov.sg"
//         const otp= "111111"

//         const opts = {
//             email: email
//         }

//         const verifyOpts = {
//             email: email,
//             otp: otp
//         }

//         var setOtp = await axios.post("http://localhost:3000/api/login/otp", opts)
//                                     .catch((err) => {return err})
//         expect(setOtp.status).toBe(200) //stored
//         var res = await axios.post("http://localhost:3000/api/login/verify", verifyOpts)
//                                 .catch((err) => {return err})

//         expect(res.status).toBe(200)
//         expect(res.data.message).toBe('OTP hash verification ok.')

//         let config = {
//             headers : {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json',
//               'Cache': 'no-cache',
//               cookie: res.headers['set-cookie']
//             }
//         }
//         var idRes = await axios.get("http://localhost:3000/api/login/isLoggedIn", config)

//         console.log(idRes.data.user.id)
//         const payload = {
//             userId: idRes.data.user.id,
//             shortUrl: "xq1",
//             longUrl: "https://www.ongxiangqian.com"
//         }

//         var isLoggedInRes = await axios.post('http://localhost:3000/api/user/url', payload, config)
//         console.log(isLoggedInRes)
//         expect(isLoggedInRes.status).toBe(200)
//         done()
//     })

// it('negative test: Creating a short url that has been used', async done => {

//     const email= "go.gov@open.gov.sg"
//     const otp= "111111"

//     const opts = {
//         email: email
//     }

//     const verifyOpts = {
//         email: email,
//         otp: otp
//     }

//     var setOtp = await axios.post("http://localhost:3000/api/login/otp", opts)
//                                 .catch((err) => {return err})
//     expect(setOtp.status).toBe(200) //stored
//     var res = await axios.post("http://localhost:3000/api/login/verify", verifyOpts)
//                             .catch((err) => {return err})

//     expect(res.status).toBe(200)
//     expect(res.data.message).toBe('OTP hash verification ok.')

//     //id will change according to when it is stored in the cache
//     const payload = {
//         userId: 1,
//         shortUrl: "xq1",
//         longUrl: "https://www.ongxiangqian.com"
//     }

//     let config = {
//         headers : {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//           'Cache': 'no-cache',
//           cookie: res.headers['set-cookie']
//         }
//     }
//     var isLoggedInRes = await axios.post('http://localhost:3000/api/user/url', payload, config)
//     console.log(isLoggedInRes)
//     expect(isLoggedInRes.status).toBe(200)
//     done()
// })

// to be touched later - stuck at uploading file to post request
// it('positive test: Given a file, it should create a shortened url', async done => {

//     const email= "go.gov@open.gov.sg"
//     const otp= "111111"

//     const opts = {
//         email: email
//     }

//     const verifyOpts = {
//         email: email,
//         otp: otp
//     }

//     var setOtp = await axios.post("http://localhost:3000/api/login/otp", opts)
//                                 .catch((err) => {return err})
//     expect(setOtp.status).toBe(200) //stored
//     var res = await axios.post("http://localhost:3000/api/login/verify", verifyOpts)
//                             .catch((err) => {return err})

//     expect(res.status).toBe(200)
//     expect(res.data.message).toBe('OTP hash verification ok.')

//     const csvPath = path.join(__dirname, 'mock.csv')
//     const myFile = fs.createReadStream(csvPath)

//     const payload = new FormData
//     payload.append("file", myFile, myFile.name)
//     payload.append('shortUrl', "76357")

//     let config = {
//         headers : {
//           'Accept': 'application/json',
//           'Cache': 'no-cache',
//           cookie: res.headers['set-cookie']
//         }
//     }
//     var isLoggedInRes = await axios.post('http://localhost:3000/api/user/url', payload, config)
//                                         .catch((err) => {return err})
//     console.log(isLoggedInRes)
//     expect(isLoggedInRes.status).toBe(200)
//     done()
// })

// })
