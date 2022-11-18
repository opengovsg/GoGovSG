import Sequelize from 'sequelize'
import { IdType } from '../../types/server/models'
import { JobItemStatusEnum, JobStatusEnum } from '../repositories/enums'
import { sequelize } from '../util/sequelize'

export interface JobType extends IdType, Sequelize.Model {
  readonly uuid: string
  readonly userId: Number
  readonly createdAt: string
  readonly updatedAt: string
  readonly status: JobStatusEnum
}

type JobStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): JobType
}

export const Job = <JobStatic>sequelize.define(
  'job',
  {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: [
        JobStatusEnum.InProgress,
        JobStatusEnum.Success,
        JobStatusEnum.Failed,
      ],
      defaultValue: JobItemStatusEnum.InProgress,
      allowNull: false,
    },
  },
  {
    defaultScope: {
      useMaster: true,
    },
  },
)

export interface JobItemType extends IdType, Sequelize.Model {
  readonly status: JobItemStatusEnum
  readonly message: string
  readonly params: JSON
  readonly jobId: number
  readonly jobItemId: string
  readonly createdAt: string
  readonly updatedAt: string
}

type JobItemStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): JobItemType
}

export const JobItem = <JobItemStatic>sequelize.define(
  'job_item',
  {
    status: {
      type: Sequelize.ENUM,
      values: [
        JobItemStatusEnum.InProgress,
        JobItemStatusEnum.Success,
        JobItemStatusEnum.Failed,
      ],
      defaultValue: JobItemStatusEnum.InProgress,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    params: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    jobItemId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    defaultScope: {
      useMaster: true,
    },
  },
)
