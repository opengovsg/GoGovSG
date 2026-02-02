import { FileTypeFilterService } from '..'

describe('FileTypeFilterService', () => {
  const service = new FileTypeFilterService(
    ['csv', 'xml'],
    new Map<string, string>([
      ['csv', 'text/csv'],
      ['dwf', 'application/x-dwf'],
      ['dxf', 'application/dxf'],
    ]),
  )

  it('get extension and mime type from csv file not detected by file-type', async () => {
    const fileTypeData = await service.getExtensionAndMimeType({
      data: Buffer.from('name,phone\nabc,123\n'),
      name: 'file.csv',
    })

    expect(fileTypeData.extension).toEqual('csv')
    expect(fileTypeData.mimeType).toEqual('text/csv')
  })

  it('get extension and mime type from dwf file not detected by file-type', async () => {
    const fileTypeData = await service.getExtensionAndMimeType({
      data: Buffer.from('(DWF V06.00)PK'),
      name: 'test.dwf',
    })

    expect(fileTypeData.extension).toEqual('dwf')
    expect(fileTypeData.mimeType).toEqual('application/x-dwf')
  })

  it('get extension and mime type from dxf file not detected by file-type', async () => {
    const fileTypeData = await service.getExtensionAndMimeType({
      data: Buffer.from('0\nSECTION\n2\nENTITIES\n0\nLINE\n8'),
      name: 'test.dxf',
    })

    expect(fileTypeData.extension).toEqual('dxf')
    expect(fileTypeData.mimeType).toEqual('application/dxf')
  })

  it('get extension and mime type from svg file not detected by file-type', async () => {
    const fileTypeData = await service.getExtensionAndMimeType({
      data: Buffer.from('<svg></svg>'),
      name: 'test.svg',
    })

    expect(fileTypeData.extension).toEqual('svg')
    expect(fileTypeData.mimeType).toEqual('text/plain')
  })

  it('get extension and mime type from file detected by file', async () => {
    const fileTypeData = await service.getExtensionAndMimeType({
      data: Buffer.from('<?xml version="1.0" encoding="ISO-8859-1" ?>'),
      name: 'file.notreallyxml',
    })

    expect(fileTypeData.extension).toEqual('xml')
    expect(fileTypeData.mimeType).toEqual('application/xml')
  })

  it('allows file extension type that are in allowed extension type', async () => {
    const result = await service.hasAllowedExtensionType('csv')
    expect(result).toBeTruthy()
  })

  it('disallows file extension type that are not in allowed extension type', async () => {
    const result = await service.hasAllowedExtensionType('svg')
    expect(result).toBeFalsy()
  })

  it('allow file extension type that are from custom file extensions', async () => {
    const result = await service.hasAllowedExtensionType('png', ['png'])
    expect(result).toBeTruthy()
  })

  it('does not allow file extension type not from custom file extensions', async () => {
    const result = await service.hasAllowedExtensionType('jpeg', ['png'])
    expect(result).toBeFalsy()
  })
})
