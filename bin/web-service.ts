#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VPCStack } from '../lib/vpc';
import { getConfig } from '../lib/config';
import { ECRStack } from '../lib/ecr';
import { ECSClusterStack } from '../lib/ecs';
import { ECSFargateStack } from '../lib/ecs';

const app = new cdk.App();
const conf = getConfig(app);

const env = {
  account: conf.account,
  region: conf.region,
}

new VPCStack(app, 'VPCStack', { env });
new ECRStack(app, 'ECRStack', { env });
new ECSClusterStack(app, 'ECSClusterStack', { env });
new ECSFargateStack(app, 'ECSFargateStack', { env });
