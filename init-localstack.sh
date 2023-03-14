#!/bin/bash
set -x
pip install awscli-local
# create s3 bucket
awslocal s3 mb s3://$AWS_BUCKET_NAME

# make s3 bucket acls private
awslocal s3api put-bucket-acl --bucket $AWS_BUCKET_NAME --acl private

# create lambda via serverless (creates lambda role, zips and deploys)
serverless deploy --stage=local -c ./serverless.dev.yml --conceal

# create sqs queue
awslocal sqs create-queue --queue-name $AWS_SQS_NAME

# create trigger for sqs to lambda
awslocal lambda create-event-source-mapping --function-name ${SERVERLESS_SERVICE}-local-${AWS_LAMBDA_NAME} --batch-size 1 --event-source-arn arn:aws:sqs:${AWS_DEFAULT_REGION}:000000000000:${AWS_SQS_NAME}
set
