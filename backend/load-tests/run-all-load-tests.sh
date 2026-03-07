#!/bin/bash

# Run All Load Tests Script
# Executes all k6 load tests sequentially

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL=${API_URL:-"https://api.bharatsahayak.in"}
RESULTS_DIR="load-test-results"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Bharat Sahayak Load Testing Suite${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "API URL: ${YELLOW}${API_URL}${NC}"
echo ""

# Create results directory
mkdir -p ${RESULTS_DIR}

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Please install k6: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo -e "${GREEN}Starting load tests...${NC}"
echo ""

# Test 1: Chat API Load Test
echo -e "${YELLOW}[1/4] Running Chat API Load Test...${NC}"
k6 run chat-load-test.js --env API_URL=${API_URL} || {
    echo -e "${RED}Chat API Load Test failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Chat API Load Test completed${NC}"
echo ""

# Wait between tests
sleep 30

# Test 2: Lambda Cold Start Test
echo -e "${YELLOW}[2/4] Running Lambda Cold Start Test...${NC}"
k6 run lambda-cold-start-test.js --env API_URL=${API_URL} || {
    echo -e "${RED}Lambda Cold Start Test failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Lambda Cold Start Test completed${NC}"
echo ""

# Wait between tests
sleep 30

# Test 3: DynamoDB Throughput Test
echo -e "${YELLOW}[3/4] Running DynamoDB Throughput Test...${NC}"
k6 run dynamodb-throughput-test.js --env API_URL=${API_URL} || {
    echo -e "${RED}DynamoDB Throughput Test failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ DynamoDB Throughput Test completed${NC}"
echo ""

# Wait between tests
sleep 30

# Test 4: Auto-Scaling Test
echo -e "${YELLOW}[4/4] Running Auto-Scaling Test...${NC}"
k6 run auto-scaling-test.js --env API_URL=${API_URL} || {
    echo -e "${RED}Auto-Scaling Test failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Auto-Scaling Test completed${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All Load Tests Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Results saved to: ${YELLOW}${RESULTS_DIR}/${NC}"
echo ""
echo "Next steps:"
echo "1. Review test results in ${RESULTS_DIR}/"
echo "2. Check CloudWatch metrics for detailed performance data"
echo "3. Analyze bottlenecks and optimize as needed"
echo "4. Re-run tests to validate improvements"
echo ""
