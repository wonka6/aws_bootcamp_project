import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 } from 'aws-cdk-lib';

export class VPCStack extends Stack {

    get availabilityZones(): string[] {
        return ['eu-central-1a', 'eu-central-1b']
    }
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);


        const vpc = new aws_ec2.Vpc(this, 'WebServiceVPC', {
            vpcName: 'web-service-vpc',
            cidr: '10.0.0.0/16',
            subnetConfiguration: [
                {
                    name: 'web-service-subnet-01',
                    cidrMask: 20,
                    subnetType: aws_ec2.SubnetType.PUBLIC,
                }
            ]
        });


    }
}