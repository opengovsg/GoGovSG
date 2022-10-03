import Sequelize from 'sequelize'
import { JobStatus, JobType } from '../repositories/enums'
import { sequelize } from '../util/sequelize'

export interface AsyncJobType extends Sequelize.Model {
  readonly id: string
  readonly status: JobStatus
  readonly message: string
  readonly type: JobType
  readonly params: JSON
  readonly outputs: JSON
  readonly userId: Number
  readonly createdAt: string
  readonly completedAt: string
}

// For sequelize define
type AsyncJobStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): AsyncJobType
}

export const AsyncJob = <AsyncJobStatic>sequelize.define(
  'async_job',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    status: {
      type: 'enum_job_status',
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    type: {
      type: 'enum_job_type',
      allowNull: false,
    },

    params: {
      type: Sequelize.JSON,
      allowNull: false,
    },

    outputs: {
      type: Sequelize.JSON,
    },

    completedAt: {
      type: Sequelize.DATE,
    },
  },
  // {}, TODO: search about scopes and if indexes are necessary
)
