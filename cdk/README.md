# Welcome to our CDK-TypeScript

This sub-project stores the CDK template for our ECS stack.

## Pre-Deployment

Before deploying the CDK template, do ensure you have the following environment variables defined:

- `CDK_DEPLOY_ACCOUNT`: AWS Account ID (12 digits)
- `CDK_DEPLOY_REGION`: AWS region to be deployed (e.g. ap-southeast-1)
- `ECS_SERVICE`: The name of service (e.g. gov, edu. health)
- `ECS_ENV`: Environment (e.g. staging, production, uat)
- `TASK_SUBNETS`: Comma-separated list of subnets where ECS tasks will reside in
- `ALB_SUBNETS`: Comma-separated list of subnets where the Application Load Balancer will reside in
- `VPC_ID`: ID of the VPC.
- `ACM_CERT_ARN`: ACM certificate ARN that the Application Load Balancer will use for TLS.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
