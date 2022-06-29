import { CfnOutput, Stack, StackProps, Fn, aws_iam, aws_elasticloadbalancingv2, Duration, aws_route53_targets } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr, aws_ecs, aws_ec2, aws_ssm, aws_certificatemanager, aws_route53 } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { getConfig } from '../config';
import { EcsApplication } from 'aws-cdk-lib/aws-codedeploy';
import { ImagePullPrincipalType } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';


export class ECSFargateStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const conf = getConfig(scope);

        const vpc = aws_ec2.Vpc.fromLookup(this, 'WebServiceVPC', {
            vpcId: conf.vpcId,
        });

        const clusterSg = aws_ec2.SecurityGroup.fromSecurityGroupId(this, 'WebServiceClusterSecurityGroup', Fn.importValue('WebServiceClusterSg'));

        const cluster = aws_ecs.Cluster.fromClusterAttributes(this, 'WebServiceCluster', {
            clusterName: Fn.importValue('WebServiceClusterName'),
            clusterArn: Fn.importValue('WebServiceClusterArn'),
            vpc,
            securityGroups: [clusterSg]
        });


        const executionRole = new aws_iam.Role(this, 'WebServiceFargateServiceIAMRole', {
            roleName: 'WebServiceFargateServiceIAMRole',
            description: 'This is a role for ecs fargate service',
            assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        executionRole.addToPolicy(new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            resources: ['*'],
            actions: ['ecr:*'],
        }));

        const repo = aws_ecr.Repository.fromRepositoryAttributes(this, 'web-service-repo', {
            repositoryName: Fn.importValue('WebServiceECRRepositoryName'),
            repositoryArn: Fn.importValue('WebServiceECRRepositoryARN'),
        });


        const taskDefinition = new aws_ecs.FargateTaskDefinition(this, 'WebServiceFargateTaskDef', {
            cpu: 512,
            family: 'WebServiceFargateTaskDef',
            executionRole,
            memoryLimitMiB: 1024,
        });

        taskDefinition.addContainer('WebServiceFargateServiceContainer', {
            containerName: 'WebServiceFargateServiceContainer',
            image: aws_ecs.ContainerImage.fromEcrRepository(repo, 'latest'),
            memoryReservationMiB: 512,
            portMappings: [
                {
                    containerPort: 80
                }
            ],
            logging: aws_ecs.LogDriver.awsLogs({ streamPrefix: 'status' }),
        });

        const serviceSg = new aws_ec2.SecurityGroup(this, 'WebServiceFargateServiceSecurityGroup', {
            securityGroupName: 'WebServiceFargateServiceSecurityGroup',
            allowAllOutbound: true,
            vpc,
        });

        const service = new aws_ecs.FargateService(this, 'WebServiceFargateService', {
            serviceName: 'WebServiceFargateService',
            cluster,
            taskDefinition: taskDefinition,
            securityGroups: [serviceSg],
            assignPublicIp: true,
            desiredCount: 1,
        });

        const autoscale = service.autoScaleTaskCount({
            minCapacity: 1,
            maxCapacity: 5,
        });

        const albSg = new aws_ec2.SecurityGroup(this, 'ALBSg', {
            vpc,
            allowAllOutbound: true,
            securityGroupName: 'web-service-alb'
        });

        albSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(80), 'allow access anywhere to http port');
        albSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(443), 'allow access anywhere to https port');

        serviceSg.addIngressRule(albSg, aws_ec2.Port.tcpRange(49153, 65535), 'allow access container ports from ALB');

        const serviceAlb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'WebServiceALB', {
            vpc,
            internetFacing: true,
            loadBalancerName: 'web-service-alb',
            securityGroup: albSg,
            deletionProtection: true,
        });

        const serviceTargetGroup = new aws_elasticloadbalancingv2.ApplicationTargetGroup(this, 'ServiceTargetGroup', {
            healthCheck: {
                enabled: true,
                path: '/',
                port: '80',
                protocol: aws_elasticloadbalancingv2.Protocol.HTTP,
                healthyHttpCodes: '200',
            },
            port: 80,
            protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
            targetGroupName: 'web-service-tg',
            targetType: aws_elasticloadbalancingv2.TargetType.IP,
            targets: [service],
            vpc
        });

 
        serviceAlb.addListener('httpListener', {
            port: 80,
            protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
            defaultTargetGroups: [serviceTargetGroup]
        });
        

        
       
        
    }
}