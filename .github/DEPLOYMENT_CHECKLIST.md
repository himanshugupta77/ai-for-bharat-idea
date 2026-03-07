# Deployment Checklist

Use this checklist before deploying to production to ensure all requirements are met.

## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests pass locally
- [ ] All property-based tests pass locally
- [ ] ESLint shows no errors
- [ ] TypeScript compilation succeeds with no errors
- [ ] Code has been reviewed by at least one team member
- [ ] No console.log or debug statements in production code
- [ ] No commented-out code blocks

### Security
- [ ] No hardcoded credentials or API keys
- [ ] Environment variables are properly configured
- [ ] AWS IAM roles follow least privilege principle
- [ ] HTTPS is enforced for all endpoints
- [ ] CORS is properly configured
- [ ] Input validation is implemented for all API endpoints
- [ ] Rate limiting is configured
- [ ] WAF rules are enabled

### Infrastructure
- [ ] SAM template validates successfully
- [ ] All required AWS resources are defined
- [ ] CloudWatch alarms are configured
- [ ] Log retention policies are set
- [ ] DynamoDB TTL is enabled for session data
- [ ] S3 buckets have proper encryption
- [ ] CloudFront distribution is configured with security headers

### Backend
- [ ] Lambda functions have appropriate memory and timeout settings
- [ ] Environment variables are set for all Lambda functions
- [ ] Bedrock model ID is correct
- [ ] DynamoDB table name is correct
- [ ] S3 bucket names are correct
- [ ] Error handling is implemented for all API endpoints
- [ ] Logging is implemented with appropriate log levels

### Frontend
- [ ] API base URL is set correctly for environment
- [ ] Build completes without errors
- [ ] Bundle size is within acceptable limits (<5MB)
- [ ] All images are optimized
- [ ] Lazy loading is implemented for non-critical resources
- [ ] Service worker is configured (if applicable)
- [ ] Meta tags are set for SEO
- [ ] Favicon is included

### Testing
- [ ] Staging environment has been tested thoroughly
- [ ] All critical user flows work on staging
- [ ] Voice input/output tested on staging
- [ ] Eligibility check tested on staging
- [ ] Multilingual support tested on staging
- [ ] Mobile responsiveness tested
- [ ] Accessibility tested with screen reader
- [ ] Low bandwidth mode tested

### Monitoring
- [ ] CloudWatch dashboards are created
- [ ] CloudWatch alarms are configured and tested
- [ ] SNS topic for alerts is configured
- [ ] Log groups are created with proper retention
- [ ] Metrics are being collected

### Documentation
- [ ] API documentation is up to date
- [ ] Deployment documentation is up to date
- [ ] README files are updated
- [ ] Architecture diagrams are current
- [ ] Changelog is updated

### Rollback Plan
- [ ] Previous version is documented
- [ ] Rollback procedure is documented and tested
- [ ] Database migration rollback plan exists (if applicable)
- [ ] Team knows how to execute rollback

## Deployment Steps

### 1. Pre-Deployment
```bash
# Verify you're on the correct branch
git branch

# Pull latest changes
git pull origin main

# Run tests locally
cd backend && pytest src/
cd ../frontend && npm run lint && npm run build
```

### 2. Trigger Deployment
1. Go to GitHub Actions
2. Select appropriate workflow (Backend or Frontend)
3. Click "Run workflow"
4. Select "production" environment
5. Click "Run workflow"

### 3. Monitor Deployment
- Watch GitHub Actions logs
- Check CloudFormation stack status
- Monitor CloudWatch logs for errors
- Verify API endpoints are responding

### 4. Post-Deployment Validation
```bash
# Test API endpoint
curl https://api.bharatsahayak.in/schemes

# Test frontend
curl https://bharatsahayak.in

# Check CloudWatch logs
aws logs tail /aws/lambda/bharat-sahayak-prod-chat --follow

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=bharat-sahayak-prod-chat \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### 5. Smoke Tests
- [ ] Homepage loads successfully
- [ ] Chat interface is functional
- [ ] Voice input works
- [ ] Voice output works
- [ ] Eligibility check works
- [ ] Scheme listing works
- [ ] Language switching works
- [ ] Dark mode toggle works
- [ ] Low bandwidth mode works

### 6. Post-Deployment Monitoring (First 30 minutes)
- [ ] Monitor error rates in CloudWatch
- [ ] Check API latency metrics
- [ ] Verify no increase in 5xx errors
- [ ] Check Lambda concurrent executions
- [ ] Monitor DynamoDB throttling
- [ ] Check CloudFront cache hit ratio

## Rollback Procedure

If issues are detected after deployment:

### Backend Rollback
```bash
# Option 1: Redeploy previous version
cd infrastructure
sam deploy --config-env prod --no-confirm-changeset

# Option 2: CloudFormation rollback
aws cloudformation cancel-update-stack --stack-name bharat-sahayak-prod
```

### Frontend Rollback
```bash
# Restore previous S3 version
aws s3api list-object-versions \
  --bucket bharat-sahayak-prod-frontend \
  --prefix index.html

aws s3api copy-object \
  --bucket bharat-sahayak-prod-frontend \
  --copy-source "bharat-sahayak-prod-frontend/index.html?versionId=<PREVIOUS_VERSION_ID>" \
  --key index.html

# Invalidate CloudFront
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## Post-Deployment

### Communication
- [ ] Notify team of successful deployment
- [ ] Update status page (if applicable)
- [ ] Document any issues encountered
- [ ] Update deployment log

### Monitoring Period
- Monitor for 24 hours after deployment
- Check error rates daily for first week
- Review user feedback and bug reports
- Monitor cost metrics

## Emergency Contacts

- **DevOps Lead**: [Contact Info]
- **Backend Lead**: [Contact Info]
- **Frontend Lead**: [Contact Info]
- **AWS Support**: [Support Plan Details]

## Notes

- Always deploy to staging first
- Never deploy on Fridays or before holidays
- Ensure at least 2 team members are available during production deployment
- Keep deployment window short (< 30 minutes)
- Have rollback plan ready before starting deployment
