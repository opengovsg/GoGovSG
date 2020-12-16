import { FileTypeFilterService } from '..'

describe('FileTypeFilterService', () => {
  const service = new FileTypeFilterService(['csv', 'xml'])

  it('allows files not detected by file-type but via extension', async () => {
    const result = await service.hasAllowedType({
      data: Buffer.from('name,phone\nabc,123\n'),
      name: 'file.csv',
    })
    expect(result).toBeTruthy()
  })

  it('allows files detected by file-type', async () => {
    const result = await service.hasAllowedType({
      data: Buffer.from('<?xml version="1.0" encoding="ISO-8859-1" ?>'),
      name: 'file.notreallyxml',
    })
    expect(result).toBeTruthy()
  })

  it('disallows files not via file-type but via extension', async () => {
    const result = await service.hasAllowedType({
      data: Buffer.from(''),
      name: 'file.jpg',
    })
    expect(result).toBeFalsy()
  })

  it('disallows files via file-type', async () => {
    const noXML = new FileTypeFilterService(['csv'])
    const result = await noXML.hasAllowedType({
      data: Buffer.from('<?xml version="1.0" encoding="ISO-8859-1" ?>'),
      name: 'file.notreallyxml',
    })
    expect(result).toBeFalsy()
  })
})
