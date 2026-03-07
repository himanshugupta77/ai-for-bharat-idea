# Deployment Guide

This comprehensive guide covers deploying the Bharat Sahayak AI Assistant to AWS, including infrastructure setup, environment configuration, CI/CD pipeline setup, and monitoring configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [AWS Resource Setup](#aws-resource-setup)
- [Environment Configuration](#environment-configuration)
- [Initial Deployment](#initial-deployment)
- [CI/CD Pipeline Setup](#cicd-pipeline-setup)
- [Monitoring and Alerting Setup](#monitoring-and-alerting-setup)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Updating Deployments](#updating-deployments)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)
- [Cost Estimation](#cost-estimation)

---

## Prerequisites

### Required Tools

1. **AWS Account** with appropriate permissions (see [IAM Requirements](#iam-requirements))
2. **AWS CLI** (version 2.x or higher)
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Configure credentials
   aws configure
   ```
3. **AWS SAM CLI** (version 1.100.0 or higher)
   ```bash
   pip install aws-sam-cli
   sam --version
   ```
4. **Python 3.12+**
   ```bash
   python --version
   ```
5. **Node.js 20+** and npm
   ```bash
   node --version
   npm --version
   ```
6. **Git** for version control
7. **jq** for JSON processing (optional but recommended)
   ```bash
   sudo apt-get install jq  # Ubuntu/Debian
   brew install jq          # macOS
   ```

### IAM Requirements

Your AWS user/role needs the following permissions:

- CloudFormation: Full access
- Lambda: Full access
- API Gateway: Full access
- DynamoDB: Full access
- S3: Full access
- CloudFront: Full access
- WAF: Full access
- KMS: Create and manage keys
- IAM: Create roles and policies
- CloudWatch: Full access
- Secrets Manager: Full access (optional)

**Recommended**: Use the `PowerUserAccess` managed policy for deployment.

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd bharat-sahayak
```

### 2. Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

#### Deploy Infrastructure and Backend

```bash
cd infrastructure
chmod +x scripts/*.sh
./scripts/deploy.sh dev  # or staging, prod
```

This script will:
- Build the SAM application
- Deploy all AWS resources (Lambda, API Gateway, DynamoDB, S3, CloudFront, WAF, KMS)
- Output the API endpoint and CloudFront URL

#### Deploy Frontend

```bash
cd infrastructure
./scripts/deploy-frontend.sh dev  # or staging, prod
```

This script will:
- Build the React frontend
- Upload to S3
- Invalidate CloudFront cache

### Option 2: Manual Deployment

#### Step 1: Deploy Infrastructure

```bash
cd infrastructure
sam build
sam deploy --guided
```

Follow the prompts:
- Stack Name: `bharat-sahayak-dev`
- AWS Region: `ap-south-1` (or your preferred region)
- Parameter Environment: `dev`
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save arguments to configuration file: `Y`

#### Step 2: Build and Deploy Frontend

```bash
cd frontend

# Get API endpoint from CloudFormation
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name bharat-sahayak-dev \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

# Build with environment variable
VITE_API_ENDPOINT=$API_ENDPOINT npm run build

# Get S3 bucket name
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name bharat-sahayak-dev \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text)

# Upload to S3
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name bharat-sahayak-dev \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
```

## Environment-Specific Deployments

### Development

```bash
./scripts/deploy.sh dev
./scripts/deploy-frontend.sh dev
```

### Staging

```bash
./scripts/deploy.sh staging
./scripts/deploy-frontend.sh staging
```

### Production

```bash
./scripts/deploy.sh prod
./scripts/deploy-frontend.sh prod
```

## Post-Deployment Configuration

### 1. Seed Initial Scheme Data

After deployment, you'll need to populate the DynamoDB table with government scheme data:

```bash
# TODO: Create and run data seeding script
python scripts/seed-schemes.py --environment dev
```

### 2. Configure Custom Domain (Optional)

If you have a custom domain:

1. Create SSL certificate in ACM (us-east-1 region for CloudFront)
2. Update CloudFormation template with certificate ARN
3. Create Route 53 records pointing to CloudFront distribution

### 3. Set Up Monitoring

CloudWatch dashboards and alarms are automatically created. Review them in the AWS Console:

```
AWS Console → CloudWatch → Dashboards → BharatSahayak-Monitoring
```

### 4. Configure SNS Notifications (Production)

For production alarms, subscribe to the SNS topic:

```bash
aws sns subscribe \
    --topic-arn <SNS-TOPIC-ARN> \
    --protocol email \
    --notification-endpoint your-email@example.com
```

## Verification

### 1. Test API Endpoints

```bash
# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name bharat-sahayak-dev \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

# Test schemes endpoint
curl $API_ENDPOINT/schemes

# Test chat endpoint
curl -X POST $API_ENDPOINT/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello", "language": "en"}'
```

### 2. Test Frontend

Visit the CloudFront URL:

```bash
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name bharat-sahayak-dev \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
    --output text)

echo "Frontend URL: https://$CLOUDFRONT_URL"
```

## Updating Deployment

### Update Backend

```bash
cd infrastructure
sam build
sam deploy  # Uses saved configuration
```

### Update Frontend

```bash
cd infrastructure
./scripts/deploy-frontend.sh dev
```

## Rollback

If deployment fails or causes issues:

```bash
# Rollback to previous CloudFormation stack version
aws cloudformation cancel-update-stack --stack-name bharat-sahayak-dev

# Or delete and redeploy
./scripts/destroy.sh dev
./scripts/deploy.sh dev
```

## Destroying Infrastructure

**WARNING**: This will delete all resources and data!

```bash
cd infrastructure
./scripts/destroy.sh dev  # or staging, prod
```

## Troubleshooting

### Lambda Function Errors

Check CloudWatch Logs:

```bash
aws logs tail /aws/lambda/bharat-sahayak-chat-dev --follow
```

### API Gateway Errors

Check API Gateway logs:

```bash
aws logs tail /aws/apigateway/bharat-sahayak-dev --follow
```

### CloudFront Issues

- Wait 15-20 minutes for distribution to fully deploy
- Check distribution status: `aws cloudfront get-distribution --id <DISTRIBUTION_ID>`
- Verify origin access identity has S3 bucket permissions

### DynamoDB Issues

- Verify table exists: `aws dynamodb describe-table --table-name bharat-sahayak-data-dev`
- Check IAM permissions for Lambda execution role

## Cost Estimation

### Development Environment

- Lambda: ~$5-10/month (low usage)
- DynamoDB: ~$1-5/month (on-demand)
- S3: ~$1/month
- CloudFront: ~$1-5/month
- API Gateway: ~$3-5/month
- **Total**: ~$11-26/month

### Production Environment

Depends on traffic. With 10,000 requests/day:
- Lambda: ~$50-100/month
- DynamoDB: ~$20-50/month
- S3: ~$5/month
- CloudFront: ~$20-50/month
- API Gateway: ~$35/month
- Bedrock: ~$100-200/month (varies by usage)
- **Total**: ~$230-460/month

## Support

For deployment issues:
1. Check CloudWatch Logs
2. Review CloudFormation events
3. Consult AWS documentation
4. Contact development team

## Next Steps

After successful deployment:
1. Seed scheme data
2. Configure monitoring alerts
3. Set up CI/CD pipeline
4. Perform load testing
5. Configure custom domain
6. Enable AWS WAF logging
7. Set up backup strategy


---

## AWS Resource Setup

### Step 1: Create S3 Buckets

Create S3 buckets for deployment artifacts and frontend hosting:

```bash
# Set your environment and region
ENVIRONMENT=dev  # or staging, prod
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create deployment bucket for SAM artifacts
aws s3 mb s3://bharat-sahayak-deployment-${ENVIRONMENT} --region ${AWS_REGION}

# Create frontend hosting bucket
aws s3 mb s3://bharat-sahayak-frontend-${ENVIRONMENT} --region ${AWS_REGION}

# Create temporary audio storage bucket
aws s3 mb s3://bharat-sahayak-temp-${ENVIRONMENT} --region ${AWS_REGION}

# Enable versioning on deployment bucket
aws s3api put-bucket-versioning \
  --bucket bharat-sahayak-deployment-${ENVIRONMENT} \
  --versioning-configuration Status=Enabled
```

### Step 2: Create KMS Keys

Create KMS keys for encryption:

```bash
# Create KMS key for DynamoDB encryption
KMS_KEY_ID=$(aws kms create-key \
  --description "Bharat Sahayak ${ENVIRONMENT} DynamoDB encryption key" \
  --query 'KeyMetadata.KeyId' \
  --output text)

# Create alias for easier reference
aws kms create-alias \
  --alias-name alias/bharat-sahayak-${ENVIRONMENT} \
  --target-key-id ${KMS_KEY_ID}

echo "KMS Key ID: ${KMS_KEY_ID}"
```

### Step 3: Request SSL Certificate (Production Only)

For production with custom domain:

```bash
# Request certificate in us-east-1 (required for CloudFront)
aws acm request-certificate \
  --domain-name bharatsahayak.in \
  --subject-alternative-names www.bharatsahayak.in \
  --validation-method DNS \
  --region us-east-1

# Note the certificate ARN for later use
```

Validate the certificate by adding DNS records as instructed by ACM.

### Step 4: Enable AWS Services

Ensure required AWS services are enabled in your region:

```bash
# Check Bedrock availability
aws bedrock list-foundation-models --region ${AWS_REGION}

# If Bedrock is not available, request access through AWS Console:
# AWS Console → Amazon Bedrock → Model access → Request access
```

---

## Environment Configuration

### Configuration Files

Create environment-specific parameter files:

```bash
mkdir -p infrastructure/parameters
```

**infrastructure/parameters/dev.json**:
```json
{
  "Parameters": {
    "Environment": "dev",
    "DomainName": "dev.bharatsahayak.in",
    "EnableWAF": "false",
    "EnablePointInTimeRecovery": "false",
    "ProvisionedConcurrency": "0",
    "LogRetentionDays": "7"
  }
}
```

**infrastructure/parameters/staging.json**:
```json
{
  "Parameters": {
    "Environment": "staging",
    "DomainName": "staging.bharatsahayak.in",
    "EnableWAF": "true",
    "EnablePointInTimeRecovery": "false",
    "ProvisionedConcurrency": "1",
    "LogRetentionDays": "30"
  }
}
```

**infrastructure/parameters/prod.json**:
```json
{
  "Parameters": {
    "Environment": "prod",
    "DomainName": "bharatsahayak.in",
    "EnableWAF": "true",
    "EnablePointInTimeRecovery": "true",
    "ProvisionedConcurrency": "2",
    "LogRetentionDays": "90",
    "SSLCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
  }
}
```

### Environment Variables

Create `.env` files for each environment:

**backend/.env.dev**:
```bash
ENVIRONMENT=dev
LOG_LEVEL=DEBUG
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229
DYNAMODB_TABLE=bharat-sahayak-data-dev
S3_TEMP_BUCKET=bharat-sahayak-temp-dev
```

**frontend/.env.dev**:
```bash
VITE_API_ENDPOINT=https://api-dev.bharatsahayak.in
VITE_ENVIRONMENT=development
```

---

## Initial Deployment

### Option 1: Automated Deployment (Recommended)

Use the provided deployment scripts:

```bash
cd infrastructure

# Make scripts executable
chmod +x scripts/*.sh

# Deploy backend infrastructure
./scripts/deploy.sh dev

# Deploy frontend
./scripts/deploy-frontend.sh dev
```

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Build SAM Application

```bash
cd infrastructure

# Build Lambda functions
sam build --use-container

# Validate template
sam validate
```

#### Step 2: Deploy Infrastructure

```bash
# Deploy with guided prompts (first time)
sam deploy \
  --guided \
  --stack-name bharat-sahayak-dev \
  --parameter-overrides $(cat parameters/dev.json | jq -r '.Parameters | to_entries | map("\(.key)=\(.value)") | join(" ")') \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1

# For subsequent deployments
sam deploy \
  --stack-name bharat-sahayak-dev \
  --parameter-overrides file://parameters/dev.json \
  --no-confirm-changeset
```

#### Step 3: Capture Outputs

```bash
# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-dev \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text)

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-dev \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

# Get DynamoDB table name
DYNAMODB_TABLE=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-dev \
  --query "Stacks[0].Outputs[?OutputKey=='DynamoDBTableName'].OutputValue" \
  --output text)

echo "API Endpoint: ${API_ENDPOINT}"
echo "CloudFront Distribution: ${DISTRIBUTION_ID}"
echo "DynamoDB Table: ${DYNAMODB_TABLE}"
```

#### Step 4: Build Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build with environment variables
VITE_API_ENDPOINT=${API_ENDPOINT} npm run build

# Verify build
ls -lh dist/
```

#### Step 5: Deploy Frontend to S3

```bash
# Get frontend bucket name
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-dev \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

# Sync files to S3
aws s3 sync dist/ s3://${FRONTEND_BUCKET} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://${FRONTEND_BUCKET}/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

#### Step 6: Invalidate CloudFront Cache

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

# Wait for invalidation to complete
aws cloudfront wait invalidation-completed \
  --distribution-id ${DISTRIBUTION_ID} \
  --id $(aws cloudfront list-invalidations \
    --distribution-id ${DISTRIBUTION_ID} \
    --query 'InvalidationList.Items[0].Id' \
    --output text)
```

#### Step 7: Seed Initial Data

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run seeding script
python scripts/seed_schemes.py --environment dev

# Verify data
aws dynamodb scan \
  --table-name ${DYNAMODB_TABLE} \
  --filter-expression "begins_with(PK, :pk)" \
  --expression-attribute-values '{":pk":{"S":"SCHEME#"}}' \
  --select COUNT
```

---

## CI/CD Pipeline Setup

### GitHub Actions Setup

#### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets**:
- `AWS_ACCESS_KEY_ID`: AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: Deployment region (e.g., ap-south-1)

**Optional Secrets**:
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `CODECOV_TOKEN`: For code coverage reporting

#### Step 2: Configure Environments

Create GitHub environments for deployment protection:

```
Settings → Environments → New environment
```

Create three environments:
1. **development**: Auto-deploy on push to `develop` branch
2. **staging**: Auto-deploy on push to `staging` branch
3. **production**: Require manual approval, deploy on push to `main` branch

For production environment:
- Enable "Required reviewers" (at least 1 reviewer)
- Add deployment branch rule: `main` only

#### Step 3: Verify Workflows

The repository includes pre-configured workflows:

- `.github/workflows/backend-deploy.yml`: Backend deployment
- `.github/workflows/frontend-deploy.yml`: Frontend deployment
- `.github/workflows/pr-validation.yml`: PR checks

Test the workflows:

```bash
# Create a test branch
git checkout -b test/deployment

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin test/deployment

# Create PR and verify checks run
```

### Manual Workflow Trigger

You can manually trigger deployments:

```bash
# Using GitHub CLI
gh workflow run backend-deploy.yml -f environment=dev

# Or through GitHub UI:
# Actions → Select workflow → Run workflow
```

---

## Monitoring and Alerting Setup

### Step 1: Create CloudWatch Dashboard

```bash
# Create monitoring dashboard
aws cloudwatch put-dashboard \
  --dashboard-name BharatSahayak-${ENVIRONMENT} \
  --dashboard-body file://infrastructure/monitoring/dashboard.json
```

**infrastructure/monitoring/dashboard.json**:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Invocations", {"stat": "Sum", "label": "Total Invocations"}],
          [".", "Errors", {"stat": "Sum", "label": "Errors"}],
          [".", "Duration", {"stat": "Average", "label": "Avg Duration"}],
          [".", "Throttles", {"stat": "Sum", "label": "Throttles"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "ap-south-1",
        "title": "Lambda Metrics",
        "yAxis": {"left": {"min": 0}}
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApiGateway", "Count", {"stat": "Sum"}],
          [".", "4XXError", {"stat": "Sum"}],
          [".", "5XXError", {"stat": "Sum"}],
          [".", "Latency", {"stat": "p95"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "ap-south-1",
        "title": "API Gateway Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/DynamoDB", "ConsumedReadCapacityUnits", {"stat": "Sum"}],
          [".", "ConsumedWriteCapacityUnits", {"stat": "Sum"}],
          [".", "UserErrors", {"stat": "Sum"}],
          [".", "SystemErrors", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "ap-south-1",
        "title": "DynamoDB Metrics"
      }
    }
  ]
}
```

### Step 2: Create SNS Topic for Alerts

```bash
# Create SNS topic
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name bharat-sahayak-alerts-${ENVIRONMENT} \
  --query 'TopicArn' \
  --output text)

# Subscribe email to topic
aws sns subscribe \
  --topic-arn ${SNS_TOPIC_ARN} \
  --protocol email \
  --notification-endpoint your-email@example.com

# Confirm subscription via email
```

### Step 3: Create CloudWatch Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name BharatSahayak-${ENVIRONMENT}-HighErrorRate \
  --alarm-description "Alert when Lambda error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions ${SNS_TOPIC_ARN}

# High latency alarm
aws cloudwatch put-metric-alarm \
  --alarm-name BharatSahayak-${ENVIRONMENT}-HighLatency \
  --alarm-description "Alert when p95 latency exceeds 10 seconds" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic p95 \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions ${SNS_TOPIC_ARN}

# DynamoDB throttling alarm
aws cloudwatch put-metric-alarm \
  --alarm-name BharatSahayak-${ENVIRONMENT}-DynamoDBThrottling \
  --alarm-description "Alert when DynamoDB requests are throttled" \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --dimensions Name=TableName,Value=${DYNAMODB_TABLE} \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions ${SNS_TOPIC_ARN}
```

### Step 4: Enable X-Ray Tracing (Optional)

```bash
# Enable X-Ray for Lambda functions
aws lambda update-function-configuration \
  --function-name bharat-sahayak-chat-${ENVIRONMENT} \
  --tracing-config Mode=Active

# Repeat for other functions
```

### Step 5: Configure Log Insights Queries

Save useful queries for troubleshooting:

```bash
# Create query for error analysis
aws logs put-query-definition \
  --name "BharatSahayak-ErrorAnalysis-${ENVIRONMENT}" \
  --query-string 'fields @timestamp, @message, statusCode, error
| filter statusCode >= 400
| stats count() by statusCode, error
| sort count desc'

# Create query for performance analysis
aws logs put-query-definition \
  --name "BharatSahayak-Performance-${ENVIRONMENT}" \
  --query-string 'fields @timestamp, path, durationMs
| stats avg(durationMs) as avgDuration, max(durationMs) as maxDuration, pct(durationMs, 95) as p95Duration by path
| sort p95Duration desc'
```

---

## Post-Deployment Configuration

### 1. Verify Deployment

Run smoke tests to verify deployment:

```bash
# Test API endpoints
curl ${API_ENDPOINT}/schemes

# Test chat endpoint
curl -X POST ${API_ENDPOINT}/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'

# Test frontend
curl -I https://${DISTRIBUTION_ID}.cloudfront.net
```

### 2. Configure Custom Domain (Production)

```bash
# Create Route 53 hosted zone (if not exists)
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name bharatsahayak.in \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' \
  --output text)

# Create A record for CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id ${HOSTED_ZONE_ID} \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "bharatsahayak.in",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$(aws cloudfront get-distribution --id ${DISTRIBUTION_ID} --query 'Distribution.DomainName' --output text)'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### 3. Enable WAF Logging (Production)

```bash
# Create S3 bucket for WAF logs
aws s3 mb s3://aws-waf-logs-bharat-sahayak-prod

# Enable WAF logging
WEB_ACL_ARN=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-prod \
  --query "Stacks[0].Outputs[?OutputKey=='WebACLArn'].OutputValue" \
  --output text)

aws wafv2 put-logging-configuration \
  --logging-configuration ResourceArn=${WEB_ACL_ARN},LogDestinationConfigs=arn:aws:s3:::aws-waf-logs-bharat-sahayak-prod
```

### 4. Set Up Backup Strategy (Production)

```bash
# Enable DynamoDB point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name ${DYNAMODB_TABLE} \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Create on-demand backup
aws dynamodb create-backup \
  --table-name ${DYNAMODB_TABLE} \
  --backup-name bharat-sahayak-prod-$(date +%Y%m%d)
```

### 5. Configure Cost Alerts

```bash
# Create budget alert
aws budgets create-budget \
  --account-id ${AWS_ACCOUNT_ID} \
  --budget '{
    "BudgetName": "BharatSahayak-Monthly-Budget",
    "BudgetLimit": {
      "Amount": "500",
      "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  }]'
```

---

## Updating Deployments

### Backend Updates

```bash
# Update Lambda function code
cd infrastructure
sam build
sam deploy --no-confirm-changeset

# Or use deployment script
./scripts/deploy.sh dev
```

### Frontend Updates

```bash
# Build and deploy frontend
cd frontend
npm run build
cd ../infrastructure
./scripts/deploy-frontend.sh dev
```

### Database Schema Updates

For DynamoDB schema changes:

```bash
# Update SAM template with new GSI or attributes
# Deploy infrastructure
sam deploy

# Run migration script if needed
python scripts/migrate_data.py --environment dev
```

### Environment Variable Updates

```bash
# Update Lambda environment variables
aws lambda update-function-configuration \
  --function-name bharat-sahayak-chat-dev \
  --environment Variables={LOG_LEVEL=INFO,NEW_VAR=value}
```

---

## Rollback Procedures

### CloudFormation Rollback

```bash
# Automatic rollback on deployment failure
# CloudFormation automatically rolls back on error

# Manual rollback to previous version
aws cloudformation update-stack \
  --stack-name bharat-sahayak-dev \
  --use-previous-template \
  --parameters UsePreviousValue=true

# Or cancel update in progress
aws cloudformation cancel-update-stack \
  --stack-name bharat-sahayak-dev
```

### Lambda Function Rollback

```bash
# List function versions
aws lambda list-versions-by-function \
  --function-name bharat-sahayak-chat-dev

# Update alias to previous version
aws lambda update-alias \
  --function-name bharat-sahayak-chat-dev \
  --name live \
  --function-version 2  # Previous version number
```

### Frontend Rollback

```bash
# List S3 object versions
aws s3api list-object-versions \
  --bucket ${FRONTEND_BUCKET} \
  --prefix index.html

# Restore previous version
aws s3api copy-object \
  --bucket ${FRONTEND_BUCKET} \
  --copy-source ${FRONTEND_BUCKET}/index.html?versionId=VERSION_ID \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

### Database Rollback

```bash
# Restore from point-in-time (production only)
aws dynamodb restore-table-to-point-in-time \
  --source-table-name ${DYNAMODB_TABLE} \
  --target-table-name ${DYNAMODB_TABLE}-restored \
  --restore-date-time 2024-01-01T12:00:00Z

# Or restore from backup
aws dynamodb restore-table-from-backup \
  --target-table-name ${DYNAMODB_TABLE}-restored \
  --backup-arn arn:aws:dynamodb:region:account:table/table-name/backup/backup-name
```

---

## Troubleshooting

### Common Deployment Issues

#### 1. SAM Build Fails

**Error**: `Build Failed: Unable to find image`

**Solution**:
```bash
# Use container build
sam build --use-container

# Or install dependencies locally
cd backend
pip install -r requirements.txt -t src/
```

#### 2. CloudFormation Stack Stuck

**Error**: Stack stuck in `UPDATE_IN_PROGRESS` or `CREATE_IN_PROGRESS`

**Solution**:
```bash
# Check stack events
aws cloudformation describe-stack-events \
  --stack-name bharat-sahayak-dev \
  --max-items 20

# Cancel update if stuck
aws cloudformation cancel-update-stack \
  --stack-name bharat-sahayak-dev

# Delete and recreate if necessary
aws cloudformation delete-stack --stack-name bharat-sahayak-dev
```

#### 3. Lambda Function Timeout

**Error**: Lambda function times out during deployment

**Solution**:
```bash
# Increase timeout in template.yaml
Timeout: 60  # Increase from 30

# Or update directly
aws lambda update-function-configuration \
  --function-name bharat-sahayak-chat-dev \
  --timeout 60
```

#### 4. DynamoDB Throttling

**Error**: `ProvisionedThroughputExceededException`

**Solution**:
```bash
# Check current capacity
aws dynamodb describe-table --table-name ${DYNAMODB_TABLE}

# Already using on-demand, check for hot partitions
# Review access patterns and add GSI if needed
```

#### 5. CloudFront Distribution Not Updating

**Error**: Changes not reflected after deployment

**Solution**:
```bash
# Wait for distribution to deploy (15-20 minutes)
aws cloudfront get-distribution --id ${DISTRIBUTION_ID} \
  --query 'Distribution.Status'

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

# Clear browser cache
```

#### 6. API Gateway CORS Errors

**Error**: `No 'Access-Control-Allow-Origin' header`

**Solution**:
```bash
# Verify CORS configuration in template.yaml
# Redeploy API Gateway
aws apigateway create-deployment \
  --rest-api-id ${API_ID} \
  --stage-name dev
```

### Debugging Tools

```bash
# View Lambda logs
aws logs tail /aws/lambda/bharat-sahayak-chat-dev --follow

# View API Gateway logs
aws logs tail /aws/apigateway/bharat-sahayak-dev --follow

# Check CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-dev \
  --query 'Stacks[0].StackStatus'

# List all resources in stack
aws cloudformation list-stack-resources \
  --stack-name bharat-sahayak-dev

# Test Lambda function locally
sam local invoke ChatFunction -e events/chat-event.json

# Start local API
sam local start-api
```

---

## Cost Estimation

### Development Environment

**Monthly Costs** (low usage, ~1000 requests/day):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 30K invocations, 1GB-sec | $5 |
| API Gateway | 30K requests | $0.10 |
| DynamoDB | On-demand, 100K reads/writes | $2 |
| S3 | 10GB storage, 1GB transfer | $0.50 |
| CloudFront | 10GB transfer | $1 |
| CloudWatch | Logs and metrics | $2 |
| **Total** | | **~$11/month** |

### Staging Environment

**Monthly Costs** (moderate usage, ~10K requests/day):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 300K invocations, 10GB-sec | $20 |
| API Gateway | 300K requests | $1 |
| DynamoDB | On-demand, 1M reads/writes | $10 |
| S3 | 20GB storage, 10GB transfer | $1 |
| CloudFront | 100GB transfer | $8 |
| CloudWatch | Logs and metrics | $5 |
| WAF | 1M requests | $5 |
| **Total** | | **~$50/month** |

### Production Environment

**Monthly Costs** (high usage, ~100K requests/day):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 3M invocations, 100GB-sec | $80 |
| API Gateway | 3M requests | $10 |
| DynamoDB | On-demand, 10M reads/writes | $50 |
| S3 | 50GB storage, 100GB transfer | $5 |
| CloudFront | 1TB transfer | $85 |
| CloudWatch | Logs and metrics | $20 |
| WAF | 10M requests | $50 |
| Bedrock | 10M tokens | $150 |
| Transcribe | 1000 hours | $60 |
| Polly | 10M characters | $40 |
| **Total** | | **~$550/month** |

### Cost Optimization Tips

1. **Enable CloudFront caching** to reduce origin requests
2. **Use provisioned concurrency** only for critical functions
3. **Implement request throttling** to prevent abuse
4. **Set up cost alerts** to monitor spending
5. **Use on-demand DynamoDB** to avoid over-provisioning
6. **Clean up old CloudWatch logs** with retention policies
7. **Compress responses** to reduce data transfer
8. **Cache API responses** in Lambda memory

---

## Destroying Infrastructure

**WARNING**: This will permanently delete all resources and data!

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name bharat-sahayak-dev

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete \
  --stack-name bharat-sahayak-dev

# Manually delete S3 buckets (not deleted by CloudFormation if not empty)
aws s3 rb s3://bharat-sahayak-frontend-dev --force
aws s3 rb s3://bharat-sahayak-temp-dev --force
aws s3 rb s3://bharat-sahayak-deployment-dev --force

# Delete CloudWatch log groups
aws logs delete-log-group --log-group-name /aws/lambda/bharat-sahayak-chat-dev
# Repeat for other log groups

# Or use destroy script
cd infrastructure
./scripts/destroy.sh dev
```

---

## Support and Resources

### Documentation
- [Architecture Guide](docs/architecture.md)
- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)

### AWS Resources
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

### Support Channels
- **Email**: devops@bharatsahayak.in
- **Slack**: #bharat-sahayak-deployments
- **GitHub Issues**: For bug reports and feature requests

---

## Deployment Checklist

Use this checklist for production deployments:

- [ ] All tests passing (unit, integration, property-based)
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] SSL certificate validated
- [ ] Database backup created
- [ ] Monitoring dashboards configured
- [ ] Alarms set up and tested
- [ ] Cost alerts configured
- [ ] Documentation updated
- [ ] Rollback plan prepared
- [ ] Stakeholders notified
- [ ] Deployment window scheduled
- [ ] Post-deployment smoke tests ready

---

*Last Updated: January 2024*
