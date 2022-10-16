import Sequelize from 'sequelize'
import { IdType } from '../../types/server/models'
import { JobItemStatusEnum, JobTypeEnum } from '../repositories/enums'
import { sequelize } from '../util/sequelize'

export interface JobType extends IdType, Sequelize.Model {
  readonly uuid: string
  readonly userId: Number
  readonly createdAt: string
  readonly updatedAt: string
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
  readonly type: JobTypeEnum
  readonly params: JSON
  readonly jobId: Number
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
        JobItemStatusEnum.Ready,
        JobItemStatusEnum.InProgress,
        JobItemStatusEnum.Success,
        JobItemStatusEnum.Failed,
      ],
      defaultValue: JobItemStatusEnum.Ready,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      defaultValue: '',
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM,
      values: [JobTypeEnum.QRCodeGeneration],
      allowNull: false,
    },
    params: {
      type: Sequelize.JSON,
      allowNull: false,
    },
  },
  {
    defaultScope: {
      useMaster: true,
    },
  },
)
