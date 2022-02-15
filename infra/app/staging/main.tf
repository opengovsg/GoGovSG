
variable "region" {
  type = string
  description = "AWS region, e.g. ap-southeast-1"
  default = "ap-southeast-1"
}

module "eb_app" {
  source = "../modules/eb_application"
  stage = "stag"
  app = "yj-test" # TODO: "gosg"
  region = var.region
}

module "main" {
  source = "../modules/main"
  stage = "staging"
  app = "yj-test" # TODO: "gosg"
  region = var.region
  vpc_config = {
    base_cidr_block = "172.31.0.0/16"
    load_balancer_subnet = {
      cidr_a = "172.31.96.0/20"
      cidr_b = "172.31.112.0/20"
      cidr_c = "172.31.128.0/20"
    }
    database_subnet = {
      cidr_a = "172.31.32.0/20"
      cidr_b = "172.31.16.0/20"
      cidr_c = "172.31.0.0/20"
    }
    ec2_subnet = {
      cidr_a = "172.31.48.0/20"
      cidr_b = "172.31.64.0/20"
      cidr_c = "172.31.80.0/20"
    }
  }
  eb_config = {
    app_name = module.eb_app.eb_app_name
    lb = {
      security_group_description = "Load Balancer Security Group"
      log_bucket = module.eb_app.eb-lb-log-bucket-name
      min_instances = 1
      max_instances = 1
      cloudflare_ips = [
        "103.21.244.0/22",
        "103.22.200.0/22",
        "103.31.4.0/22",
        "104.16.0.0/13",
        "104.24.0.0/14",
        "108.162.192.0/18",
        "131.0.72.0/22",
        "141.101.64.0/18",
        "162.158.0.0/15",
        "172.64.0.0/13",
        "173.245.48.0/20",
        "188.114.96.0/20",
        "190.93.240.0/20",
        "197.234.240.0/22",
        "198.41.128.0/17",
      ]
    }
    ec2 = {
      security_group_description = "VPC Security Group"
    }
  }
  redis_config = {
    security_group_description = "Allows redis to talk to EB"
    node_count = 1
  }
}
