#!/bin/bash
set -x
pip install awscli-local
awslocal s3 mb s3://$AWS_BUCKET_NAME
awslocal s3api put-bucket-acl --bucket $AWS_BUCKET_NAME --acl private

awslocal sqs create-queue --queue-name $AWS_SQS_BULK_QRCODE_GENERATE_START
awslocal sqs list-queues
set
