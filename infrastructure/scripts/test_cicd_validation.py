#!/usr/bin/env python3
"""
Unit tests for CI/CD test scripts and rollback procedures.

This test file validates that the CI/CD testing infrastructure itself
is correctly configured and functional.

Requirements tested:
- Requirement 19.1: Deployment automation
- Requirement 19.2: Rollback procedures
"""

import os
import sys
import unittest
import yaml
from pathlib import Path


class TestCICDWorkflows(unittest.TestCase):
    """Test CI/CD workflow configurations."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.workflows_dir = Path(".github/workflows")
        self.backend_workflow = self.workflows_dir / "backend-deploy.yml"
        self.frontend_workflow = self.workflows_dir / "frontend-deploy.yml"
        self.cicd_test_workflow = self.workflows_dir / "test-cicd.yml"
    
    def test_workflow_files_exist(self):
        """Test that all required workflow files exist."""
        self.assertTrue(
            self.backend_workflow.exists(),
            "Backend deployment workflow file missing"
        )
        self.assertTrue(
            self.frontend_workflow.exists(),
            "Frontend deployment workflow file missing"
        )
        self.assertTrue(
            self.cicd_test_workflow.exists(),
            "CI/CD test workflow file missing"
        )
    
    def test_workflow_yaml_syntax(self):
        """Test that workflow files have valid YAML syntax."""
        for workflow_file in self.workflows_dir.glob("*.yml"):
            with self.subTest(workflow=workflow_file.name):
                with open(workflow_file, 'r') as f:
                    try:
                        yaml.safe_load(f)
                    except yaml.YAMLError as e:
                        self.fail(f"Invalid YAML in {workflow_file.name}: {e}")
    
    def test_backend_workflow_structure(self):
        """Test backend workflow has required structure."""
        with open(self.backend_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        # Check required top-level keys
        self.assertIn('name', workflow, "Workflow missing 'name' field")
        self.assertIn('on', workflow, "Workflow missing 'on' field")
        self.assertIn('jobs', workflow, "Workflow missing 'jobs' field")
        
        # Check required jobs
        jobs = workflow['jobs']
        self.assertIn('test', jobs, "Missing 'test' job")
        self.assertIn('build', jobs, "Missing 'build' job")
        self.assertIn('deploy-dev', jobs, "Missing 'deploy-dev' job")
        self.assertIn('deploy-staging', jobs, "Missing 'deploy-staging' job")
        self.assertIn('deploy-production', jobs, "Missing 'deploy-production' job")
    
    def test_frontend_workflow_structure(self):
        """Test frontend workflow has required structure."""
        with open(self.frontend_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        # Check required top-level keys
        self.assertIn('name', workflow, "Workflow missing 'name' field")
        self.assertIn('on', workflow, "Workflow missing 'on' field")
        self.assertIn('jobs', workflow, "Workflow missing 'jobs' field")
        
        # Check required jobs
        jobs = workflow['jobs']
        self.assertIn('lint-and-test', jobs, "Missing 'lint-and-test' job")
        self.assertIn('build', jobs, "Missing 'build' job")
        self.assertIn('deploy-dev', jobs, "Missing 'deploy-dev' job")
        self.assertIn('deploy-staging', jobs, "Missing 'deploy-staging' job")
        self.assertIn('deploy-production', jobs, "Missing 'deploy-production' job")
    
    def test_job_dependencies(self):
        """Test that deployment jobs have correct dependencies."""
        with open(self.backend_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        
        # Build should depend on test
        self.assertIn('needs', jobs['build'], "Build job missing 'needs' field")
        self.assertEqual(jobs['build']['needs'], 'test', "Build should depend on test")
        
        # Deploy-dev should depend on build
        self.assertIn('needs', jobs['deploy-dev'], "Deploy-dev missing 'needs' field")
        self.assertEqual(jobs['deploy-dev']['needs'], 'build', "Deploy-dev should depend on build")
        
        # Deploy-production should depend on deploy-staging
        self.assertIn('needs', jobs['deploy-production'], "Deploy-production missing 'needs' field")
        needs = jobs['deploy-production']['needs']
        if isinstance(needs, list):
            self.assertIn('deploy-staging', needs, "Deploy-production should depend on deploy-staging")
        else:
            self.fail("Deploy-production 'needs' should be a list")
    
    def test_manual_production_trigger(self):
        """Test that production deployment requires manual trigger."""
        with open(self.backend_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        deploy_prod = jobs['deploy-production']
        
        # Check if condition includes workflow_dispatch
        self.assertIn('if', deploy_prod, "Production deployment missing 'if' condition")
        condition = deploy_prod['if']
        self.assertIn('workflow_dispatch', condition, 
                     "Production deployment should require workflow_dispatch")
    
    def test_environment_protection(self):
        """Test that deployment jobs have environment protection."""
        with open(self.backend_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        
        for job_name in ['deploy-dev', 'deploy-staging', 'deploy-production']:
            with self.subTest(job=job_name):
                job = jobs[job_name]
                self.assertIn('environment', job, f"{job_name} missing environment protection")
                self.assertIn('name', job['environment'], f"{job_name} environment missing name")


class TestRollbackScripts(unittest.TestCase):
    """Test rollback script configurations."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.scripts_dir = Path("infrastructure/scripts")
        self.rollback_script = self.scripts_dir / "rollback.sh"
        self.test_rollback_script = self.scripts_dir / "test_rollback.py"
    
    def test_rollback_script_exists(self):
        """Test that rollback script exists."""
        self.assertTrue(
            self.rollback_script.exists(),
            "Rollback script missing"
        )
    
    def test_rollback_test_script_exists(self):
        """Test that rollback test script exists."""
        self.assertTrue(
            self.test_rollback_script.exists(),
            "Rollback test script missing"
        )
    
    def test_rollback_script_has_shebang(self):
        """Test that rollback script has proper shebang."""
        with open(self.rollback_script, 'r') as f:
            first_line = f.readline().strip()
        
        self.assertTrue(
            first_line.startswith('#!/'),
            "Rollback script missing shebang"
        )
    
    def test_rollback_script_has_required_commands(self):
        """Test that rollback script contains required AWS commands."""
        with open(self.rollback_script, 'r') as f:
            content = f.read()
        
        required_commands = [
            'aws cloudformation',
            'describe-stacks',
            'describe-stack-events',
            'continue-update-rollback'
        ]
        
        for command in required_commands:
            with self.subTest(command=command):
                self.assertIn(
                    command,
                    content,
                    f"Rollback script missing '{command}' command"
                )
    
    def test_rollback_test_script_is_valid_python(self):
        """Test that rollback test script is valid Python."""
        try:
            with open(self.test_rollback_script, 'r') as f:
                compile(f.read(), self.test_rollback_script, 'exec')
        except SyntaxError as e:
            self.fail(f"Rollback test script has syntax error: {e}")


class TestEnvironmentConfigurations(unittest.TestCase):
    """Test environment configuration files."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.env_dir = Path(".github/environments")
    
    def test_environment_directory_exists(self):
        """Test that environment directory exists."""
        self.assertTrue(
            self.env_dir.exists(),
            "Environment directory missing"
        )
    
    def test_environment_files_exist(self):
        """Test that all environment files exist."""
        environments = ['dev', 'staging', 'production']
        
        for env in environments:
            with self.subTest(environment=env):
                env_file = self.env_dir / f"{env}.env"
                self.assertTrue(
                    env_file.exists(),
                    f"Environment file for {env} missing"
                )


class TestCICDTestWorkflow(unittest.TestCase):
    """Test the CI/CD test workflow itself."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_workflow = Path(".github/workflows/test-cicd.yml")
    
    def test_cicd_test_workflow_exists(self):
        """Test that CI/CD test workflow exists."""
        self.assertTrue(
            self.test_workflow.exists(),
            "CI/CD test workflow missing"
        )
    
    def test_cicd_test_workflow_structure(self):
        """Test CI/CD test workflow has required structure."""
        with open(self.test_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        # Check required jobs
        jobs = workflow['jobs']
        required_jobs = [
            'validate-workflows',
            'validate-environments',
            'validate-error-handling',
            'validate-rollback-capability',
            'validate-security',
            'validate-triggers'
        ]
        
        for job_name in required_jobs:
            with self.subTest(job=job_name):
                self.assertIn(
                    job_name,
                    jobs,
                    f"CI/CD test workflow missing '{job_name}' job"
                )
    
    def test_cicd_test_workflow_has_summary(self):
        """Test that CI/CD test workflow has summary job."""
        with open(self.test_workflow, 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        self.assertIn('test-summary', jobs, "Missing test-summary job")
        
        # Check that summary depends on all test jobs
        summary_job = jobs['test-summary']
        self.assertIn('needs', summary_job, "Summary job missing 'needs' field")
        
        needs = summary_job['needs']
        self.assertIsInstance(needs, list, "Summary 'needs' should be a list")
        self.assertGreater(len(needs), 0, "Summary should depend on test jobs")


class TestDeploymentSafety(unittest.TestCase):
    """Test deployment safety mechanisms."""
    
    def test_backend_has_test_job(self):
        """Test that backend workflow runs tests before deployment."""
        with open(Path(".github/workflows/backend-deploy.yml"), 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        self.assertIn('test', jobs, "Backend workflow missing test job")
        
        # Check that test job runs pytest
        test_job = jobs['test']
        steps = test_job['steps']
        
        has_pytest = any(
            'pytest' in str(step.get('run', ''))
            for step in steps
        )
        self.assertTrue(has_pytest, "Test job doesn't run pytest")
    
    def test_frontend_has_test_job(self):
        """Test that frontend workflow runs tests before deployment."""
        with open(Path(".github/workflows/frontend-deploy.yml"), 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        self.assertIn('lint-and-test', jobs, "Frontend workflow missing lint-and-test job")
    
    def test_artifacts_are_uploaded(self):
        """Test that build artifacts are uploaded."""
        with open(Path(".github/workflows/backend-deploy.yml"), 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        build_job = jobs['build']
        steps = build_job['steps']
        
        has_upload = any(
            step.get('uses', '').startswith('actions/upload-artifact')
            for step in steps
        )
        self.assertTrue(has_upload, "Build job doesn't upload artifacts")
    
    def test_artifacts_are_downloaded(self):
        """Test that deployment jobs download artifacts."""
        with open(Path(".github/workflows/backend-deploy.yml"), 'r') as f:
            workflow = yaml.safe_load(f)
        
        jobs = workflow['jobs']
        deploy_dev = jobs['deploy-dev']
        steps = deploy_dev['steps']
        
        has_download = any(
            step.get('uses', '').startswith('actions/download-artifact')
            for step in steps
        )
        self.assertTrue(has_download, "Deploy job doesn't download artifacts")


def run_tests():
    """Run all tests and return exit code."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestCICDWorkflows))
    suite.addTests(loader.loadTestsFromTestCase(TestRollbackScripts))
    suite.addTests(loader.loadTestsFromTestCase(TestEnvironmentConfigurations))
    suite.addTests(loader.loadTestsFromTestCase(TestCICDTestWorkflow))
    suite.addTests(loader.loadTestsFromTestCase(TestDeploymentSafety))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    sys.exit(run_tests())
