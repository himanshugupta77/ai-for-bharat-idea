#!/bin/bash

# Deployment script for Bharat Sahayak infrastructure
# Usage: ./deploy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "========================================="
echo "Deploying Bharat Sahayak - ${ENVIRONMENT}"
echo "========================================="

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "Error: Invalid environment. Use: dev, staging, or prod"
    exit 1
fi

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    exit 1
fi

# Check SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "Error: AWS SAM CLI is not installed"
    exit 1
fi

# Build SAM application
echo "Building SAM application..."
sam build

# Deploy SAM application
echo "Deploying SAM stack..."
sam deploy \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --parameter-overrides "Environment=${ENVIRONMENT}" \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

# Get stack outputs
echo "Retrieving stack outputs..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
    --output text)

FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text)

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "API Endpoint: ${API_ENDPOINT}"
echo "CloudFront URL: https://${CLOUDFRONT_URL}"
echo "Frontend Bucket: ${FRONTEND_BUCKET}"
echo ""
echo "Next steps:"
echo "1. Build and deploy frontend: cd ../frontend && npm run build"
echo "2. Sync to S3: aws s3 sync dist/ s3://${FRONTEND_BUCKET} --delete"
echo "3. Invalidate CloudFront cache"
echo "========================================="
