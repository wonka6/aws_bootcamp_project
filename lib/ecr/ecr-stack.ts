import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';

export class ECRStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);


        const ecrRepo = new aws_ecr.Repository(this, 'WebServiceECRRepository', {
            repositoryName: 'web-service-repo',
            removalPolicy: RemovalPolicy.RETAIN,
        });

        new CfnOutput(this, 'WebServiceECRRepositoryARN', {
            exportName: 'WebServiceECRRepositoryARN',
            value: ecrRepo.repositoryArn
        });

        new CfnOutput(this, 'WebServiceECRRepositoryName', {
            exportName: 'WebServiceECRRepositoryName',
            value: ecrRepo.repositoryName
        });


    }
}