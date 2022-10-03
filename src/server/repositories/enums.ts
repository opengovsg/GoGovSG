/**
 * The state in which url objects can be in.
 */
export enum StorableUrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export enum JobStatus {
  Ready = 'READY',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

export enum JobType {
  QRCodeGeneration = 'QR_CODE_GENERATION',
}

export default { StorableUrlState }
