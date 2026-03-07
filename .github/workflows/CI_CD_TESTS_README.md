# CI/CD Tests Documentation

This document describes the comprehensive CI/CD testing suite for the Bharat Sahayak AI Assistant platform.

## Overview

The CI/CD tests validate workflow execution, deployment procedures, and rollback mechanisms to ensure reliable and safe deployments across all environments (dev, staging, production).

## Requirements Validated

- **Requirement 18.5**: Platform SHALL include rollback capabilities for failed deployments
- **Requirement 19.1**: Deployment automation with proper testing
- **Requirement 19.2**: Rollback procedures for failed deployments

## Test Components

### 1. GitHub Actions Workflow Tests (`.github/workflows/test-cicd.yml`)

Automated tests that run on every PR to validate CI/CD configuration:

#### Test Jobs

1. **validate-workflows**
   - Validates YAML syntax of all workflow files
   - Checks required workflow fields (name, on, jobs)
   - Validates job dependencies (build → deploy → production)
   - Ensures proper deployment sequencing

2. **validate-environments**
   - Checks environment configuration files exist (dev, staging, production)
   - Validates environment variables
   - Verifies deployment stage configuration

3. **validate-error-handling**
   - Ensures tests run before deployment
   - Verifies build artifacts are uploaded and downloaded
   - Checks for integration tests after deployment
   - Validates smoke tests for production

4. **validate-rollback-capability**
   - Checks SAM deployment configuration
   - Verifies CloudFormation stack naming for version tracking
   - Validates deployment notifications
   - Ensures manual approval for production deployments

5. **validate-security**
   - Checks for hardcoded secrets
   - Verifies secrets are properly referenced from GitHub Secrets
   - Validates security scanning in PR validation

6. **validate-triggers**
   - Checks workflow triggers (push, pull_request, workflow_dispatch)
   - Validates path filters for efficient CI/CD
   - Ensures proper branch targeting

### 2. Rollback Test Script (`infrastructure/scripts/test_rollback.py`)

Python script that validates rollback capabilities:

#### Tests Performed

1. **test_stack_exists**
   - Verifies CloudFormation stack exists
   - Validates stack can be queried

2. **test_stack_history**
   - Checks stack has deployment history
   - Validates resource tracking

3. **test_changeset_creation**
   - Simulates rollback by creating a changeset
   - Validates changeset can be created and deleted

4. **test_sam_config_exists**
   - Verifies SAM configuration file exists
   - Checks environment-specific configurations

5. **test_rollback_script_exists**
   - Validates rollback script is present
   - Checks for required rollback commands

6. **test_deployment_artifacts**
   - Verifies build artifacts can be versioned
   - Checks artifact directory structure

7. **test_github_workflow_rollback**
   - Validates workflow has rollback capability
   - Checks for manual triggers, environment protection, and artifact management

### 3. Rollback Script (`infrastructure/scripts/rollback.sh`)

Bash script that performs actual rollback operations:

#### Features

- **Stack Status Detection**: Identifies current stack state
- **Automatic Rollback**: Handles different failure scenarios
- **Manual Confirmation**: Requires user confirmation before rollback
- **Event Logging**: Shows recent stack events for debugging
- **Verification**: Confirms rollback success

#### Supported Stack States

- `UPDATE_ROLLBACK_COMPLETE`: Stack successfully rolled back
- `UPDATE_FAILED`: Failed update, initiates rollback
- `UPDATE_ROLLBACK_FAILED`: Failed rollback, attempts to continue
- `UPDATE_IN_PROGRESS`: Waits for update to complete
- `ROLLBACK_IN_PROGRESS`: Waits for rollback to complete

## Running the Tests

### Automated Tests (GitHub Actions)

The CI/CD tests run automatically on:
- Pull requests to `main` or `develop` branches
- Changes to `.github/workflows/**` files
- Manual trigger via `workflow_dispatch`

```bash
# Trigger manually via GitHub UI:
# Actions → CI/CD Workflow Tests → Run workflow
```

### Rollback Tests (Local)

Run the rollback test script locally:

```bash
# Dry run (default - doesn't execute destructive commands)
python3 infrastructure/scripts/test_rollback.py --environment dev

# Actual execution (use with caution)
python3 infrastructure/scripts/test_rollback.py --environment dev --no-dry-run

# Test different environments
python3 infrastructure/scripts/test_rollback.py --environment staging
python3 infrastructure/scripts/test_rollback.py --environment prod
```

### Rollback Script (Production Use)

Execute rollback for a failed deployment:

```bash
# Make script executable (Unix/Linux/Mac)
chmod +x infrastructure/scripts/rollback.sh

# Run rollback for dev environment
./infrastructure/scripts/rollback.sh dev

# Run rollback for staging environment
./infrastructure/scripts/rollback.sh staging

# Run rollback for production environment
./infrastructure/scripts/rollback.sh prod
```

## Test Coverage

### Workflow Execution Tests

- ✅ YAML syntax validation
- ✅ Required field validation
- ✅ Job dependency validation
- ✅ Environment configuration
- ✅ Test execution before deployment
- ✅ Build artifact management
- ✅ Integration test execution
- ✅ Smoke test execution

### Rollback Capability Tests

- ✅ Stack existence verification
- ✅ Stack history tracking
- ✅ Changeset creation/deletion
- ✅ SAM configuration validation
- ✅ Rollback script availability
- ✅ Artifact versioning
- ✅ Manual approval for production
- ✅ Deployment notifications

### Security Tests

- ✅ No hardcoded secrets
- ✅ Proper secret management
- ✅ Security scanning integration
- ✅ Vulnerability detection

## Rollback Procedures

### Automatic Rollback

CloudFormation automatically rolls back failed updates:

1. Update fails during deployment
2. CloudFormation detects failure
3. Automatic rollback to previous state
4. Stack returns to `UPDATE_ROLLBACK_COMPLETE`

### Manual Rollback

For manual rollback to a specific version:

1. **Identify Previous Version**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name bharat-sahayak-prod \
     --query 'Stacks[0].Parameters'
   ```

2. **Download Previous Artifacts**
   - Access GitHub Actions artifacts from previous successful deployment
   - Or rebuild from previous git commit

3. **Deploy Previous Version**
   ```bash
   cd infrastructure
   sam deploy \
     --config-file samconfig.toml \
     --config-env prod \
     --parameter-overrides Version=<previous-version>
   ```

4. **Verify Rollback**
   ```bash
   ./infrastructure/scripts/rollback.sh prod
   ```

### Emergency Rollback

For critical production issues:

1. **Stop Current Deployment**
   - Cancel GitHub Actions workflow if running
   - Or wait for automatic rollback

2. **Execute Rollback Script**
   ```bash
   ./infrastructure/scripts/rollback.sh prod
   ```

3. **Verify Services**
   - Check API endpoints
   - Run smoke tests
   - Monitor CloudWatch metrics

4. **Notify Team**
   - Document the issue
   - Create incident report
   - Plan fix and redeployment

## Deployment Safety Mechanisms

### Pre-Deployment

1. **Automated Tests**: All tests must pass before deployment
2. **Code Review**: PRs require approval
3. **Security Scan**: Trivy vulnerability scanning
4. **Build Validation**: Successful build required

### During Deployment

1. **Staged Rollout**: Dev → Staging → Production
2. **Manual Approval**: Production requires manual trigger
3. **Artifact Versioning**: Build artifacts are versioned and stored
4. **CloudFormation Changesets**: Preview changes before applying

### Post-Deployment

1. **Integration Tests**: Validate API functionality
2. **Smoke Tests**: Verify critical paths
3. **Monitoring**: CloudWatch alarms for errors
4. **Notifications**: Deployment status notifications

## Troubleshooting

### Test Failures

**Workflow validation fails:**
- Check YAML syntax with `yamllint`
- Verify all required fields are present
- Ensure job dependencies are correct

**Rollback test fails:**
- Verify AWS credentials are configured
- Check CloudFormation stack exists
- Ensure SAM CLI is installed

**Security scan fails:**
- Review Trivy vulnerability report
- Update dependencies with vulnerabilities
- Add exceptions for false positives

### Rollback Issues

**Stack in UPDATE_ROLLBACK_FAILED state:**
```bash
# Continue the rollback
aws cloudformation continue-update-rollback \
  --stack-name bharat-sahayak-prod

# Monitor progress
aws cloudformation describe-stack-events \
  --stack-name bharat-sahayak-prod
```

**Cannot rollback stable stack:**
- Identify previous working version
- Redeploy using previous artifacts
- Use SAM deploy with version parameter

**Rollback script fails:**
- Check AWS credentials
- Verify stack name is correct
- Review CloudWatch logs for errors

## Best Practices

### Development

1. **Test Locally**: Run rollback tests before pushing
2. **Small Changes**: Make incremental changes
3. **Feature Flags**: Use flags for risky features
4. **Documentation**: Document deployment changes

### Deployment

1. **Deploy to Dev First**: Always test in dev environment
2. **Validate Staging**: Ensure staging works before production
3. **Manual Production**: Never auto-deploy to production
4. **Monitor Closely**: Watch metrics during deployment

### Rollback

1. **Quick Decision**: Don't hesitate to rollback if issues arise
2. **Document Issues**: Record what went wrong
3. **Root Cause Analysis**: Investigate after rollback
4. **Fix Forward**: Plan proper fix for next deployment

## Continuous Improvement

### Metrics to Track

- Deployment success rate
- Rollback frequency
- Time to rollback
- Test coverage
- Mean time to recovery (MTTR)

### Regular Reviews

- Monthly review of deployment failures
- Quarterly review of rollback procedures
- Annual review of CI/CD pipeline
- Continuous improvement of test coverage

## References

- [AWS CloudFormation Rollback](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-rollback-triggers.html)
- [AWS SAM Deployment](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [Deployment Best Practices](https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/)
