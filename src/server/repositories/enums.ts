/**
 * The state in which url objects can be in.
 */
export enum StorableUrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export enum JobStatusEnum {
  Ready = 'READY',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

export enum JobTypeEnum {
  QRCodeGeneration = 'QR_CODE_GENERATION',
}

export default { StorableUrlState }
export enum StorableUrlSource {
  Bulk = 'BULK',
  Api = 'API',
  Console = 'CONSOLE',
}

export default { StorableUrlState, StorableUrlSource }
