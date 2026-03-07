#!/bin/bash

# Destroy infrastructure script
# Usage: ./destroy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "========================================="
echo "WARNING: Destroying Bharat Sahayak - ${ENVIRONMENT}"
echo "========================================="

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "Error: Invalid environment. Use: dev, staging, or prod"
    exit 1
fi

# Confirm destruction
read -p "Are you sure you want to destroy the ${ENVIRONMENT} environment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

# Get bucket names
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text 2>/dev/null || echo "")

TEMP_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "bharat-sahayak-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='TempBucketName'].OutputValue" \
    --output text 2>/dev/null || echo "")

# Empty S3 buckets
if [ -n "$FRONTEND_BUCKET" ]; then
    echo "Emptying frontend bucket..."
    aws s3 rm "s3://${FRONTEND_BUCKET}" --recursive || true
fi

if [ -n "$TEMP_BUCKET" ]; then
    echo "Emptying temp bucket..."
    aws s3 rm "s3://${TEMP_BUCKET}" --recursive || true
fi

# Delete CloudFormation stack
echo "Deleting CloudFormation stack..."
aws cloudformation delete-stack --stack-name "bharat-sahayak-${ENVIRONMENT}"

echo "Waiting for stack deletion..."
aws cloudformation wait stack-delete-complete --stack-name "bharat-sahayak-${ENVIRONMENT}"

echo ""
echo "========================================="
echo "Infrastructure Destroyed!"
echo "========================================="
