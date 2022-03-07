terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

variable "region" {
  type = string
  description = "AWS region, e.g. ap-southeast-1"
}

provider "aws" {
  region = var.region
}

variable "stage" {
  type = string
  description = "Name of stage, i.e. staging, production"
}

variable "app" {
  type = string
  description = "Name of app, i.e. gosg or edu"
}

resource "aws_elastic_beanstalk_application" "application" {
  name = "${var.app}-${var.stage}"
}

data "aws_caller_identity" "current" {}
data "aws_elb_service_account" "main" {}

resource "aws_s3_bucket" "lb-logs" {
  bucket_prefix = "${var.app}-${var.stage}-lb-logs"
  acl    = "private"
}

resource "aws_s3_bucket_policy" "lb-bucket-policy" {
  bucket = aws_s3_bucket.lb-logs.id

  policy = <<POLICY
{
    "Id": "Policy",
    "Version": "2012-10-17",
    "Statement": [{
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "${data.aws_elb_service_account.main.arn}"
                ]
            },
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "${aws_s3_bucket.lb-logs.arn}/*/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        },
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "delivery.logs.amazonaws.com"
            },
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "${aws_s3_bucket.lb-logs.arn}/*/AWSLogs/${data.aws_caller_identity.current.account_id}/*",
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": "bucket-owner-full-control"
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "delivery.logs.amazonaws.com"
            },
            "Action": [
                "s3:GetBucketAcl"
            ],
            "Resource": "${aws_s3_bucket.lb-logs.arn}"
        }
    ]
}
POLICY
}

output "eb_app_name" {
  value = aws_elastic_beanstalk_application.application.name
}

output "eb-lb-log-bucket-name" {
  value = aws_s3_bucket.lb-logs.bucket
}
