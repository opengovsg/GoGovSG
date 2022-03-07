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

variable "vpc_config" {
  description = "Configuration for VPC and subnets"
  type = object({
    base_cidr_block = string
    load_balancer_subnet = object({
      cidr_a = string
      cidr_b = string
      cidr_c = string
    })
    database_subnet = object({
      cidr_a = string
      cidr_b = string
      cidr_c = string
    })
    ec2_subnet = object({
      cidr_a = string
      cidr_b = string
      cidr_c = string
    })
  })
}

variable "eb_config" {
  description = "Configuration for Elasticbeanstalk resources"
  type = object({
    app_name = string
    lb = object({
      security_group_description = string
      cloudflare_ips = list(string)
      min_instances = number
      max_instances = number
      log_bucket = string
    })
    ec2 = object({
      security_group_description = string
    })
  })
}

variable "redis_config" {
  description = "Configuration for redis"
  type = object({
    security_group_description = string
    node_count = number
  })
}

data "aws_caller_identity" "current" {}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_config.base_cidr_block
  enable_dns_hostnames = true
  tags = {
    Name = var.stage
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app}-${var.stage}"
  }
}

resource "aws_route_table" "lb" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  route {
    ipv6_cidr_block = "::/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "${var.app}-lb-public-${var.stage}"
  }
}

resource "aws_route_table" "ec2" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "${var.app}-ec2-private-${var.stage}"
  }
}

resource "aws_route_table_association" "lb_a" {
  subnet_id = aws_subnet.lb_a.id
  route_table_id = aws_route_table.lb.id
}

resource "aws_route_table_association" "lb_b" {
  subnet_id = aws_subnet.lb_b.id
  route_table_id = aws_route_table.lb.id
}

resource "aws_route_table_association" "lb_c" {
  subnet_id = aws_subnet.lb_c.id
  route_table_id = aws_route_table.lb.id
}

resource "aws_route_table_association" "ec2_a" {
  subnet_id = aws_subnet.ec2_a.id
  route_table_id = aws_route_table.ec2.id
}

resource "aws_route_table_association" "ec2_b" {
  subnet_id = aws_subnet.ec2_b.id
  route_table_id = aws_route_table.ec2.id
}

resource "aws_route_table_association" "ec2_c" {
  subnet_id = aws_subnet.ec2_c.id
  route_table_id = aws_route_table.ec2.id
}

# Using for_each didn't work because TF complains the
# id is not known before apply, and cannot determine the
# number of instances to create.
#resource "aws_route_table_association" "ec2" {
#  for_each = toset([
#    aws_subnet.ec2_a.id,
#    aws_subnet.ec2_b.id,
#    aws_subnet.ec2_c.id
#  ])
#  subnet_id = each.key
#  route_table_id = aws_route_table.ec2.id
#}

resource "aws_subnet" "lb_a" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1a"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.load_balancer_subnet.cidr_a
  tags = {
    Name = "${var.stage}-lb-1a"
  }
}

resource "aws_subnet" "lb_b" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1b"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.load_balancer_subnet.cidr_b
  tags = {
    Name = "${var.stage}-lb-1b"
  }
}

resource "aws_subnet" "lb_c" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1c"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.load_balancer_subnet.cidr_c
  tags = {
    Name = "${var.stage}-lb-1c"
  }
}

resource "aws_subnet" "db_a" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1a"
  map_public_ip_on_launch = true
  cidr_block = var.vpc_config.database_subnet.cidr_a
  tags = {
    Name = "${var.stage}-db-1a"
  }
}

resource "aws_subnet" "db_b" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1b"
  map_public_ip_on_launch = true
  cidr_block = var.vpc_config.database_subnet.cidr_b
  tags = {
    Name = "${var.stage}-db-1b"
  }
}

resource "aws_subnet" "db_c" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1c"
  map_public_ip_on_launch = true
  cidr_block = var.vpc_config.database_subnet.cidr_c
  tags = {
    Name = "${var.stage}-db-1c"
  }
}

resource "aws_subnet" "ec2_a" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1a"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.ec2_subnet.cidr_a
  tags = {
    Name = "${var.stage}-ec2-1a"
  }
}

resource "aws_subnet" "ec2_b" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1b"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.ec2_subnet.cidr_b
  tags = {
    Name = "${var.stage}-ec2-1b"
  }
}

resource "aws_subnet" "ec2_c" {
  vpc_id = aws_vpc.main.id
  availability_zone = "ap-southeast-1c"
  map_public_ip_on_launch = false
  cidr_block = var.vpc_config.ec2_subnet.cidr_c
  tags = {
    Name = "${var.stage}-ec2-1c"
  }
}

# TODO: Consider provisioning one NAT per AZ
resource "aws_eip" "nat" {
  depends_on = [aws_internet_gateway.igw]
  vpc = true
}

resource "aws_nat_gateway" "nat" {
  depends_on = [aws_internet_gateway.igw]
  allocation_id = aws_eip.nat.id
  connectivity_type = "public"
  subnet_id = aws_subnet.lb_a.id

  tags = {
    Name = "${var.app}-${var.stage}"
  }
}

resource "aws_security_group" "eb_lb" {
  vpc_id = aws_vpc.main.id
  name = "${var.app}-${var.stage}-eb-lb"
  description = var.eb_config.lb.security_group_description

  ingress {
    description = "cloudflare"
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = var.eb_config.lb.cloudflare_ips
  }

  egress {
      from_port = 80
      to_port = 80
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app}-eb-lb-${var.stage}"
  }
}

resource "aws_security_group" "eb_ec2" {
  vpc_id = aws_vpc.main.id
  name = "${var.app}-${var.stage}-eb-ec2"
  description = var.eb_config.ec2.security_group_description

  ingress {
    description = "Inbound load balancer"
    from_port = 443
    to_port = 443
    protocol = "tcp"
    security_groups = [aws_security_group.eb_lb.id]
  }

  ingress {
    description = "Inbound load balancer"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = [aws_security_group.eb_lb.id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app}-eb-ec2-${var.stage}"
  }
}

resource "aws_security_group" "redis" {
  vpc_id = aws_vpc.main.id
  name = "${var.app}-${var.stage}-redis"
  description = var.redis_config.security_group_description

  ingress {
    description = "Elasticbeanstalk EC2 instances"
    from_port = 6379
    to_port = 6379
    protocol = "tcp"
    security_groups = [aws_security_group.eb_ec2.id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app}-redis-${var.stage}"
  }
}

resource "aws_elasticache_subnet_group" "subnets" {
  name = "${var.app}-subnet-group-${var.stage}"
  description = "Redis subnet group"
  subnet_ids = [
    aws_subnet.ec2_a.id,
    aws_subnet.ec2_b.id,
    aws_subnet.ec2_c.id
  ]
}

resource "aws_elasticache_replication_group" "redis" {
  automatic_failover_enabled = true
  availability_zones = [
    "ap-southeast-1a",
    "ap-southeast-1b",
    "ap-southeast-1c"
  ]
  replication_group_id = "${var.app}-${var.stage}"
  replication_group_description = "Redis replication group"
  subnet_group_name = aws_elasticache_subnet_group.subnets.id
  node_type = "cache.t3.micro"
  engine_version = "6.x"
  at_rest_encryption_enabled = true
  maintenance_window = "sat:21:00-sat:22:00"
  multi_az_enabled = true
  number_cache_clusters = 3
  port = 6379
  security_group_ids = [aws_security_group.redis.id]
}

resource "aws_elastic_beanstalk_environment" "environment" {
  depends_on = [
    # Provisioned load balancer needs a route to the
    # internet gateway
    aws_internet_gateway.igw,
    aws_route_table_association.lb_a,
    aws_route_table_association.lb_b,
    aws_route_table_association.lb_c,
    # NAT gateway needed for EC2 instances to fetch init
    # files from S3, contact EB for health updates, and
    # Cloudformation signals.
    aws_nat_gateway.nat,
  ]
  name = "${var.app}-${var.stage}"
  application = var.eb_config.app_name
  solution_stack_name = "64bit Amazon Linux 2 v3.4.5 running Docker"
  wait_for_ready_timeout = "10m"
  poll_interval = "10s"

  setting {
    namespace = "aws:autoscaling:asg"
    name = "Availability Zones"
    value = "Any 3"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name = "MinSize"
    value = var.eb_config.lb.min_instances
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name = "MaxSize"
    value = var.eb_config.lb.max_instances
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name = "IamInstanceProfile"
    value = "aws-elasticbeanstalk-ec2-role"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name = "InstanceType"
    value = "t3.micro"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name = "MonitoringInterval"
    value = "1 minute"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name = "SecurityGroups"
    value = aws_security_group.eb_ec2.id
  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name = "BreachDuration"
    value = "1"
  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name = "Period"
    value = "1"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name = "VPCId"
    value = aws_vpc.main.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name = "Subnets"
    value = "${aws_subnet.ec2_a.id},${aws_subnet.ec2_b.id},${aws_subnet.ec2_c.id}"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name = "ELBSubnets"
    value = "${aws_subnet.lb_a.id},${aws_subnet.lb_b.id},${aws_subnet.lb_c.id}"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name = "AssociatePublicIpAddress"
    value = true
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name = "StreamLogs"
    value = true
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name = "RetentionInDays"
    value = 365
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs:health"
    name = "HealthStreamingEnabled"
    value = true
  }

  setting {
    namespace = "aws:elasticbeanstalk:command"
    name = "DeploymentPolicy"
    value = "RollingWithAdditionalBatch"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name = "ServiceRole"
    value = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-elasticbeanstalk-service-role"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name = "LoadBalancerType"
    value = "application"
  }

  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name = "SystemType"
    value = "enhanced"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
    name = "UpdateLevel"
    value = "patch"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
    name = "InstanceRefreshEnabled"
    value = true
  }
#
#  setting {
#    namespace = "aws:elbv2:listener:443"
#    name      = "Protocol"
#    value     = "HTTPS"
#  }
#
#  setting {
#    namespace = "aws:elbv2:listener:443"
#    name      = "ListenerEnabled"
#    value     = false
#  }
#
#  setting {
#    namespace = "aws:elbv2:listener:443"
#    name      = "SSLCertificateArns"
#    value     = "arn:aws:acm:ap-southeast-1:<account_id>:certificate/<secret-uuid>"
#  }

  setting {
    namespace = "aws:elbv2:loadbalancer"
    name = "AccessLogsS3Bucket"
    value = var.eb_config.lb.log_bucket
  }

  setting {
    namespace = "aws:elbv2:loadbalancer"
    name = "AccessLogsS3Enabled"
    value = true
  }

  setting {
    namespace = "aws:elbv2:loadbalancer"
    name = "AccessLogsS3Prefix"
    value = "${var.app}-${var.stage}"
  }

  setting {
    namespace = "aws:elbv2:loadbalancer"
    name = "ManagedSecurityGroup"
    value = aws_security_group.eb_lb.id
  }

  setting {
    namespace = "aws:elbv2:loadbalancer"
    name = "SecurityGroups"
    value = aws_security_group.eb_lb.id
  }
}

locals {
  eb_log_group_name = "/aws/elasticbeanstalk/${var.app}-${var.stage}/var/log/eb-docker/containers/eb-current-app/stdouterr.log"
}

resource "aws_cloudwatch_log_metric_filter" "http_404" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-404"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode=404, ..., useragent!=facebookexternalhit*, latency, ms]"
  metric_transformation {
    name = "${var.app}-${var.stage}-404"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_400" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-400"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode=400, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-400"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_401" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-401"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode=401, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-401"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_403" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-403"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode=403, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-403"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_4xx" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-4xx"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode>404 && statuscode<500, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-4xx"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_500" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-500"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode=500, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-500"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "http_5xx" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-5xx"
  log_group_name = local.eb_log_group_name
  pattern = "[ip, hyphen, timestamp, http, statuscode>500, ...]"
  metric_transformation {
    name = "${var.app}-${var.stage}-5xx"
    namespace = "HTTP status"
    value = 1
  }
}

resource "aws_cloudwatch_log_metric_filter" "malicious_activity" {
  depends_on = [aws_elastic_beanstalk_environment.environment]
  name = "${var.app}-${var.stage}-malicious-activity"
  log_group_name = local.eb_log_group_name
  pattern = "Malicious"
  metric_transformation {
    name = "${var.app}-${var.stage}-malicious-activity"
    namespace = "Malicious activity"
    value = 1
    default_value = 0
  }
}
