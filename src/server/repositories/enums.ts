/**
 * The state in which url objects can be in.
 */
export enum StorableUrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export enum StorableUrlSource {
  Bulk = 'BULK',
  Api = 'API',
  Console = 'CONSOLE',
}

export enum JobItemStatusEnum {
  Ready = 'READY',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

export enum JobTypeEnum {
  QRCodeGeneration = 'QR_CODE_GENERATION',
}
