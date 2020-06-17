/**
 * The state in which url objects can be in.
 */
export enum StorableUrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

/**
 * The state in which week.
 */
export enum StorageWeekState {
  Monday = 'MONDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY',
  Thursday = 'THURSDAY',
  Friday = 'FRIDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
}

export default { StorableUrlState, StorageWeekState }
