import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { EcsApplication } from 'aws-cdk-lib/aws-codedeploy'
import {
  ISubnet,
  Peer,
  Port,
  SecurityGroup,
  Subnet,
  Vpc,
} from 'aws-cdk-lib/aws-ec2'
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  DeploymentControllerType,
  FargatePlatformVersion,
  FargateTaskDefinition,
  // LogDriver,
  OperatingSystemFamily,
} from 'aws-cdk-lib/aws-ecs'
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns'
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  TargetType,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

const {
  /**
   * Comma-separated string of subnet IDs.
   * In the form of 'subnet-01a,subnet-2fb' etc.
   */
  TASK_SUBNETS,
  ALB_SUBNETS,
  VPC_ID,
  ACM_CERT_ARN,
} = process.env

const APPLICATION_PORT = 80

export default class GoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    if (!(TASK_SUBNETS && ALB_SUBNETS && VPC_ID && ACM_CERT_ARN))
      throw new Error('Missing env variables.')

    /**
     * Put all generated subnets in a shared pool for use. This
     * solves the edge case where EC2 and VPC subnets have
     * overlaps, and CDK will throw error saying subnet of
     * a certain ID already exists.
     */
    const subnetMap: Record<string, ISubnet> = {}
    TASK_SUBNETS.split(',').forEach((id) => {
      if (!(id in subnetMap)) subnetMap[id] = Subnet.fromSubnetId(this, id, id)
    })
    ALB_SUBNETS.split(',').forEach((id) => {
      if (!(id in subnetMap)) subnetMap[id] = Subnet.fromSubnetId(this, id, id)
    })

    /**
     * Import an existing VPC for instance placement.
     */
    const vpc = Vpc.fromLookup(this, 'vpc', {
      vpcId: VPC_ID,
    })

    const cluster = new Cluster(this, 'Cluster', {
      vpc,
    })

    const taskPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['s3:*'],
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: ['logs:*'],
          resources: ['*'],
        }),
      ],
    })

    const taskRole = new Role(this, 'TaskRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: {
        s3: taskPolicy,
      },
    })

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 4096,
      cpu: 2048,
      taskRole,
      runtimePlatform: {
        operatingSystemFamily: OperatingSystemFamily.LINUX,
        cpuArchitecture: CpuArchitecture.X86_64,
      },
    })

    taskDefinition.addContainer('Container', {
      /**
       * Note there are many other set-up steps involved in order for the main
       * gogovsg image to work. Because of that, it is better to start with an
       * image that works right out of the box, and then create subsequent
       * revisions of the task definition. This way, our cloudformation deployment
       * won't get stuck waiting for the ECS service to deploy successfully.
       *
       * Broadly, we need to do these further steps:
       * 1. Whitelist task security groups to access Redis & Postgres
       * 2. Add Env vars into task definition.
       * 3. Use our app's image, changing container port to 8080.
       */
      image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      containerName: 'gogovsg',
      portMappings: [{ containerPort: APPLICATION_PORT }],
      // logging: LogDriver.awsLogs({
      //   streamPrefix: 'go-ecs',
      // }),
    })

    const albSecurityGroup = new SecurityGroup(this, 'alb-sg', {
      vpc,
      description: 'ALB security group',
    })

    const cloudflareIpRanges =
      '173.245.48.0/20,103.21.244.0/22,103.22.200.0/22,103.31.4.0/22,141.101.64.0/18,108.162.192.0/18,190.93.240.0/20,188.114.96.0/20,197.234.240.0/22,198.41.128.0/17,162.158.0.0/15,104.16.0.0/13,104.24.0.0/14,172.64.0.0/13,131.0.72.0/22'.split(
        ',',
      )
    cloudflareIpRanges.forEach((range) => {
      albSecurityGroup.addIngressRule(Peer.ipv4(range), Port.tcp(443))
    })

    const ecsSecurityGroup = new SecurityGroup(this, 'ecs-security-group', {
      vpc,
      description: 'ECS security group.',
    })
    /**
     * CDK will automatically add port 80 access to the ALB, which allows our starter
     * application to work. However, the main app's container listens on port
     * 8080, so we need to make an addition here.
     */
    ecsSecurityGroup.addIngressRule(
      Peer.securityGroupId(albSecurityGroup.securityGroupId),
      Port.tcp(8080),
    )

    const alb = new ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnets: ALB_SUBNETS.split(',').map((id) => subnetMap[id]),
      },
    })

    const blueGreenTargetGroup = new ApplicationTargetGroup(this, 'tg2', {
      targetType: TargetType.IP,
      /**
       * This port setting is meaningless when used in conjunction with ECS.
       * This is great because our initial app is a hello-world on port 80 but
       * our main app is on 8080.
       *
       * Https://stackoverflow.com/a/42823808.
       */
      port: APPLICATION_PORT,
      vpc,
    })

    const service = new ApplicationLoadBalancedFargateService(this, 'Service', {
      /**
       * Pin version to latest, but don't update further, because we
       * haven't figured whether version changes will trigger recreation
       * of service.
       */
      platformVersion: FargatePlatformVersion.VERSION1_4,
      cluster,
      taskDefinition,
      taskSubnets: {
        subnets: TASK_SUBNETS.split(',').map((id) => subnetMap[id]),
      },
      securityGroups: [ecsSecurityGroup],
      deploymentController: {
        type: DeploymentControllerType.CODE_DEPLOY,
      },
      protocol: ApplicationProtocol.HTTPS,
      redirectHTTP: true,
      certificate: Certificate.fromCertificateArn(this, 'Cert', ACM_CERT_ARN),
      loadBalancer: alb,
      openListener: false,
      /**
       * Tasks need to be able to access internet services. Unless a NAT gateway
       * is provided in the task subnets, set this option to true. This way,
       * each task gets a public IP (and can hence receive network response packets).
       */
      assignPublicIp: false,
    })

    const scalableTarget = service.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 20,
    })
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 40,
      scaleOutCooldown: Duration.seconds(120), // Be more aggressive in scaling out than scaling in.
    })

    const codedeployApp = new EcsApplication(this, 'app')
  }
}
