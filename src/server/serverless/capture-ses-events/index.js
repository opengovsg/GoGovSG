// Lambda invokes the named export from index.handler, not the default export.
// eslint-disable-next-line import/prefer-default-export
export async function handler(event) {
  event.Records.forEach((e) => {
    console.log(e.Sns)
  })
}
