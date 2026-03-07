#!/bin/bash

# Frontend deployment script
# Usage: ./deploy-frontend.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "========================================="
echo "Deploying Frontend - ${ENVIRONMENT}"
echo "========================================="

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "Error: Invalid environment. Use: dev, staging, or prod"
    exit 1
fi

# Get stack outputs
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

echo "Frontend Bucket: ${FRONTEND_BUCKET}"
echo "Distribution ID: ${DISTRIBUTION_ID}"
echo "API Endpoint: ${API_ENDPOINT}"

# Navigate to frontend directory
cd ../../frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build frontend with environment variables
echo "Building frontend..."
VITE_API_ENDPOINT="${API_ENDPOINT}" npm run build

# Sync to S3
echo "Syncing to S3..."
aws s3 sync dist/ "s3://${FRONTEND_BUCKET}" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html "s3://${FRONTEND_BUCKET}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*"

echo ""
echo "========================================="
echo "Frontend Deployment Complete!"
echo "========================================="
echo "Visit: https://$(aws cloudfront get-distribution --id ${DISTRIBUTION_ID} --query 'Distribution.DomainName' --output text)"
echo "========================================="
