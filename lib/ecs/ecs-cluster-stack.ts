import { CfnOutput, Stack, StackProps, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr, aws_ecs, aws_ec2 } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { getConfig } from '../config';

export class ECSClusterStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const conf = getConfig(scope);

        const vpc = aws_ec2.Vpc.fromLookup(this, 'WebServiceVPC', {
            vpcId: conf.vpcId,
        });

        const cluster = new aws_ecs.Cluster(this, 'WebServiceCluster', {
            clusterName: 'web-service-cluster',
            vpc,
        });

        const clusterSg = new aws_ec2.SecurityGroup(this, 'WebServiceClusterSecurityGroup', {
            securityGroupName: 'web-service-sg',
            vpc,
        });

        clusterSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(80), 'allow access from anywhere to http port');
        clusterSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(443), 'allow access from anywhere to https port');

        cluster.connections.addSecurityGroup();


        new CfnOutput(this, 'WebServiceClusterARN', {
            exportName: 'WebServiceClusterARN',
            value: cluster.clusterArn
        });

        new CfnOutput(this, 'WebServiceClusterName', {
            exportName: 'WebServiceClusterName',
            value: cluster.clusterName
        });

        new CfnOutput(this, 'WebServiceClusterSg', {
            exportName: 'WebServiceClusterSg',
            value: clusterSg.securityGroupId
        });


    }
}