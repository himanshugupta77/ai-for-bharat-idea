# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated deployment of the Bharat Sahayak AI Assistant platform.

## Workflows

### 1. Backend Deployment (`backend-deploy.yml`)

Automates the deployment of Python Lambda functions and AWS infrastructure.

**Triggers:**
- Push to `main` or `develop` branches (when backend/infrastructure files change)
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch with environment selection

**Jobs:**
1. **Test**: Runs unit tests and property-based tests
2. **Build**: Packages Lambda functions using AWS SAM
3. **Deploy-Dev**: Deploys to development environment (auto on `develop` branch)
4. **Deploy-Staging**: Deploys to staging environment (auto on `main` branch)
5. **Deploy-Production**: Deploys to production (manual approval required)

**Environment Variables:**
- `PYTHON_VERSION`: Python runtime version (3.12)
- `AWS_REGION`: AWS region for deployment (ap-south-1)

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`: AWS access key for dev/staging
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for dev/staging
- `AWS_ACCESS_KEY_ID_PROD`: AWS access key for production
- `AWS_SECRET_ACCESS_KEY_PROD`: AWS secret key for production

### 2. Frontend Deployment (`frontend-deploy.yml`)

Automates the deployment of React TypeScript frontend to S3 and CloudFront.

**Triggers:**
- Push to `main` or `develop` branches (when frontend files change)
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch with environment selection

**Jobs:**
1. **Lint-and-Test**: Runs ESLint, Prettier, TypeScript checks, and unit tests
2. **Build**: Creates production bundles for all environments
3. **Deploy-Dev**: Deploys to development S3 bucket (auto on `develop` branch)
4. **Deploy-Staging**: Deploys to staging S3 bucket (auto on `main` branch)
5. **Deploy-Production**: Deploys to production S3 bucket (manual approval required)

**Environment Variables:**
- `NODE_VERSION`: Node.js version (20)
- `AWS_REGION`: AWS region for deployment (ap-south-1)

**Required Secrets:**
- Same as backend deployment

## Deployment Stages

### Development (dev)
- **Trigger**: Automatic on push to `develop` branch
- **Purpose**: Continuous integration testing
- **URL**: https://dev.bharatsahayak.in
- **API**: https://dev-api.bharatsahayak.in

### Staging (staging)
- **Trigger**: Automatic on push to `main` branch
- **Purpose**: Pre-production validation
- **URL**: https://staging.bharatsahayak.in
- **API**: https://staging-api.bharatsahayak.in

### Production (prod)
- **Trigger**: Manual workflow dispatch only
- **Purpose**: Live production environment
- **URL**: https://bharatsahayak.in
- **API**: https://api.bharatsahayak.in
- **Approval**: Requires manual approval in GitHub environments

## Environment Configuration

Environment-specific configurations are stored in `.github/environments/`:
- `dev.env`: Development environment settings
- `staging.env`: Staging environment settings
- `production.env`: Production environment settings

## Setup Instructions

### 1. Configure GitHub Secrets

Navigate to repository Settings → Secrets and variables → Actions, and add:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ACCESS_KEY_ID_PROD
AWS_SECRET_ACCESS_KEY_PROD
```

### 2. Configure GitHub Environments

Create three environments in Settings → Environments:
- `dev`: No protection rules
- `staging`: No protection rules
- `production`: Enable "Required reviewers" with at least 1 reviewer

### 3. Update SAM Configuration

Ensure `infrastructure/samconfig.toml` has configurations for all environments:

```toml
[dev.deploy.parameters]
stack_name = "bharat-sahayak-dev"
region = "ap-south-1"
capabilities = "CAPABILITY_IAM"

[staging.deploy.parameters]
stack_name = "bharat-sahayak-staging"
region = "ap-south-1"
capabilities = "CAPABILITY_IAM"

[prod.deploy.parameters]
stack_name = "bharat-sahayak-prod"
region = "ap-south-1"
capabilities = "CAPABILITY_IAM"
```

## Deployment Process

### Automatic Deployments

1. **To Dev**: Push to `develop` branch
   ```bash
   git checkout develop
   git add .
   git commit -m "feat: add new feature"
   git push origin develop
   ```

2. **To Staging**: Merge to `main` branch
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

### Manual Production Deployment

1. Go to Actions tab in GitHub
2. Select "Backend Deployment" or "Frontend Deployment"
3. Click "Run workflow"
4. Select "production" from environment dropdown
5. Click "Run workflow"
6. Wait for approval from designated reviewers
7. Approve deployment in Environments page

## Rollback Procedure

### Backend Rollback

```bash
# List previous stack versions
aws cloudformation list-stack-resources --stack-name bharat-sahayak-prod

# Rollback to previous version
cd infrastructure
sam deploy --config-env prod --no-confirm-changeset
```

### Frontend Rollback

```bash
# Restore previous S3 version
aws s3api list-object-versions \
  --bucket bharat-sahayak-prod-frontend \
  --prefix index.html

aws s3api copy-object \
  --bucket bharat-sahayak-prod-frontend \
  --copy-source bharat-sahayak-prod-frontend/index.html?versionId=<VERSION_ID> \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

## Monitoring Deployments

### View Deployment Logs

1. Go to Actions tab
2. Click on the workflow run
3. Expand job steps to view logs

### Check Deployment Status

```bash
# Backend stack status
aws cloudformation describe-stacks \
  --stack-name bharat-sahayak-prod \
  --query 'Stacks[0].StackStatus'

# Frontend deployment status
aws s3 ls s3://bharat-sahayak-prod-frontend/

# CloudFront invalidation status
aws cloudfront list-invalidations \
  --distribution-id <DISTRIBUTION_ID>
```

## Troubleshooting

### Build Failures

**Issue**: Tests fail during CI
- Check test logs in Actions tab
- Run tests locally: `cd backend && pytest src/`
- Fix failing tests and push again

**Issue**: SAM build fails
- Verify `infrastructure/template.yaml` syntax
- Check Lambda function dependencies in `requirements.txt`
- Test SAM build locally: `cd infrastructure && sam build`

### Deployment Failures

**Issue**: CloudFormation stack update fails
- Check CloudFormation console for detailed error
- Verify IAM permissions for deployment user
- Check for resource conflicts (e.g., S3 bucket names)

**Issue**: S3 sync fails
- Verify S3 bucket exists and is accessible
- Check AWS credentials are valid
- Verify bucket policy allows PutObject

**Issue**: CloudFront invalidation fails
- Verify distribution ID is correct
- Check CloudFront distribution status
- Ensure IAM user has `cloudfront:CreateInvalidation` permission

## Best Practices

1. **Always test locally before pushing**
   ```bash
   # Backend
   cd backend && pytest src/
   
   # Frontend
   cd frontend && npm run lint && npm run build
   ```

2. **Use feature branches for development**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR to develop
   ```

3. **Review staging before production**
   - Test all features on staging environment
   - Verify API endpoints are working
   - Check CloudWatch logs for errors

4. **Monitor after deployment**
   - Check CloudWatch dashboards
   - Review error rates and latency
   - Verify all Lambda functions are healthy

5. **Keep secrets secure**
   - Never commit AWS credentials
   - Rotate credentials regularly
   - Use least privilege IAM policies

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
