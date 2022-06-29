### Bootsrap bootcamp-project
cdk bootstrap aws://781026332009/eu-central-1 --app "npx ts-node bin/web-service.ts" 

### Deploy VPCStack
cdk synth --app "npx ts-node bin/web-service.ts" VPCStack
cdk deploy --app "npx ts-node bin/web-service.ts" VPCStack

### Deploy ECRStack
cdk synth --app "npx ts-node bin/web-service.ts" ECRStack
cdk deploy --app "npx ts-node bin/web-service.ts" ECRStack

### Deploy ECSClusterStack
cdk synth --app "npx ts-node bin/web-service.ts" ECSClusterStack
cdk deploy --app "npx ts-node bin/web-service.ts" ECSClusterStack

### Deploy ECSFargateStack
cdk synth --app "npx ts-node bin/web-service.ts" ECSFargateStack
cdk deploy --app "npx ts-node bin/web-service.ts" ECSFargateStack
