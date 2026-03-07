#!/bin/bash
# Deployment Rollback Script
# 
# This script provides rollback capabilities for failed deployments
# by reverting to the previous CloudFormation stack version.
#
# Requirements:
# - Requirement 18.5: Platform SHALL include rollback capabilities for failed deployments
# - Requirement 19.1: Deployment automation
# - Requirement 19.2: Rollback procedures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
STACK_NAME="bharat-sahayak-${ENVIRONMENT}"
AWS_REGION=${AWS_REGION:-ap-south-1}

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Deployment Rollback Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Stack Name: ${STACK_NAME}"
echo "AWS Region: ${AWS_REGION}"
echo ""

# Function to check if stack exists
check_stack_exists() {
    echo "Checking if stack exists..."
    if aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query 'Stacks[0].StackName' \
        --output text > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Stack ${STACK_NAME} exists${NC}"
        return 0
    else
        echo -e "${RED}❌ Stack ${STACK_NAME} not found${NC}"
        return 1
    fi
}

# Function to get current stack status
get_stack_status() {
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query 'Stacks[0].StackStatus' \
        --output text
}

# Function to list recent stack events
list_recent_events() {
    echo ""
    echo "Recent stack events:"
    aws cloudformation describe-stack-events \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --max-items 10 \
        --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' \
        --output table
}

# Function to perform rollback
perform_rollback() {
    local current_status=$(get_stack_status)
    
    echo ""
    echo "Current stack status: ${current_status}"
    
    case "${current_status}" in
        UPDATE_ROLLBACK_COMPLETE|UPDATE_COMPLETE|CREATE_COMPLETE)
            echo -e "${YELLOW}⚠️  Stack is in a stable state: ${current_status}${NC}"
            echo "To rollback to a previous version, you need to:"
            echo "1. Identify the previous working version"
            echo "2. Redeploy using that version's artifacts"
            echo ""
            echo "Example:"
            echo "  sam deploy --config-file samconfig.toml --config-env ${ENVIRONMENT} --parameter-overrides Version=<previous-version>"
            ;;
        
        UPDATE_IN_PROGRESS|UPDATE_COMPLETE_CLEANUP_IN_PROGRESS)
            echo -e "${YELLOW}⚠️  Stack update is in progress${NC}"
            echo "Wait for the update to complete or fail before attempting rollback"
            ;;
        
        UPDATE_ROLLBACK_IN_PROGRESS|UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS)
            echo -e "${YELLOW}⚠️  Stack is already rolling back${NC}"
            echo "Waiting for rollback to complete..."
            aws cloudformation wait stack-rollback-complete \
                --stack-name "${STACK_NAME}" \
                --region "${AWS_REGION}"
            echo -e "${GREEN}✅ Rollback completed${NC}"
            ;;
        
        UPDATE_FAILED|UPDATE_ROLLBACK_FAILED)
            echo -e "${RED}❌ Stack is in a failed state: ${current_status}${NC}"
            echo "Attempting to continue rollback..."
            
            # Try to continue the rollback
            aws cloudformation continue-update-rollback \
                --stack-name "${STACK_NAME}" \
                --region "${AWS_REGION}" || {
                echo -e "${RED}❌ Failed to continue rollback${NC}"
                echo "Manual intervention may be required"
                list_recent_events
                exit 1
            }
            
            echo "Waiting for rollback to complete..."
            aws cloudformation wait stack-rollback-complete \
                --stack-name "${STACK_NAME}" \
                --region "${AWS_REGION}"
            echo -e "${GREEN}✅ Rollback completed${NC}"
            ;;
        
        ROLLBACK_IN_PROGRESS|ROLLBACK_COMPLETE)
            echo -e "${YELLOW}⚠️  Stack creation rollback: ${current_status}${NC}"
            if [ "${current_status}" == "ROLLBACK_IN_PROGRESS" ]; then
                echo "Waiting for rollback to complete..."
                aws cloudformation wait stack-rollback-complete \
                    --stack-name "${STACK_NAME}" \
                    --region "${AWS_REGION}"
            fi
            echo -e "${GREEN}✅ Rollback completed${NC}"
            ;;
        
        *)
            echo -e "${RED}❌ Unknown stack status: ${current_status}${NC}"
            echo "Manual intervention required"
            list_recent_events
            exit 1
            ;;
    esac
}

# Function to verify rollback success
verify_rollback() {
    echo ""
    echo "Verifying rollback..."
    
    local final_status=$(get_stack_status)
    
    case "${final_status}" in
        UPDATE_ROLLBACK_COMPLETE|ROLLBACK_COMPLETE)
            echo -e "${GREEN}✅ Rollback successful${NC}"
            echo "Stack is now in state: ${final_status}"
            return 0
            ;;
        UPDATE_COMPLETE|CREATE_COMPLETE)
            echo -e "${GREEN}✅ Stack is in a stable state: ${final_status}${NC}"
            return 0
            ;;
        *)
            echo -e "${RED}❌ Rollback verification failed${NC}"
            echo "Stack is in state: ${final_status}"
            return 1
            ;;
    esac
}

# Function to get stack outputs
get_stack_outputs() {
    echo ""
    echo "Stack outputs:"
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
}

# Main execution
main() {
    # Check if stack exists
    if ! check_stack_exists; then
        echo -e "${RED}❌ Cannot rollback non-existent stack${NC}"
        exit 1
    fi
    
    # Show recent events
    list_recent_events
    
    # Confirm rollback
    echo ""
    read -p "Do you want to proceed with rollback? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
        echo "Rollback cancelled"
        exit 0
    fi
    
    # Perform rollback
    perform_rollback
    
    # Verify rollback
    if verify_rollback; then
        get_stack_outputs
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}Rollback completed successfully${NC}"
        echo -e "${GREEN}========================================${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}Rollback failed${NC}"
        echo -e "${RED}========================================${NC}"
        list_recent_events
        exit 1
    fi
}

# Run main function
main
