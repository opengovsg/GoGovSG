#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import GoStack from '../lib/go-stack'

const { CDK_DEPLOY_ACCOUNT, CDK_DEPLOY_REGION, ECS_SERVICE, ECS_ENV } =
  process.env
if (!(CDK_DEPLOY_ACCOUNT && CDK_DEPLOY_REGION && ECS_SERVICE && ECS_ENV)) {
  throw new Error('Missing env variables.')
}

const app = new cdk.App()

// eslint-disable-next-line no-new
new GoStack(app, `ecs-${ECS_SERVICE}-${ECS_ENV}`, {
  env: {
    account: CDK_DEPLOY_ACCOUNT,
    region: CDK_DEPLOY_REGION,
  },
})
