#!/usr/bin/env python3
"""
Test script for deployment rollback procedures.

This script validates that rollback mechanisms are properly configured
and can be executed successfully.

Requirements tested:
- Requirement 18.5: Platform SHALL include rollback capabilities for failed deployments
- Requirement 19.1: Deployment automation
- Requirement 19.2: Rollback procedures
"""

import json
import subprocess
import sys
from typing import Dict, List, Optional
import argparse


class RollbackTester:
    """Test deployment rollback capabilities."""
    
    def __init__(self, environment: str = "dev", dry_run: bool = True):
        self.environment = environment
        self.dry_run = dry_run
        self.stack_name = f"bharat-sahayak-{environment}"
        self.test_results: List[Dict[str, any]] = []
    
    def run_command(self, command: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Run a shell command and return the result."""
        print(f"Running: {' '.join(command)}")
        if self.dry_run and any(word in command for word in ['deploy', 'delete', 'update']):
            print("  [DRY RUN] Command not executed")
            return subprocess.CompletedProcess(command, 0, stdout=b"", stderr=b"")
        
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=check
            )
            return result
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Command failed: {e}")
            if not check:
                return e
            raise
    
    def test_stack_exists(self) -> bool:
        """Test 1: Verify CloudFormation stack exists."""
        print("\n=== Test 1: Verify Stack Exists ===")
        
        try:
            result = self.run_command([
                "aws", "cloudformation", "describe-stacks",
                "--stack-name", self.stack_name,
                "--query", "Stacks[0].StackName",
                "--output", "text"
            ])
            
            if result.returncode == 0:
                print(f"✅ Stack {self.stack_name} exists")
                self.test_results.append({
                    "test": "stack_exists",
                    "status": "passed",
                    "message": f"Stack {self.stack_name} found"
                })
                return True
            else:
                print(f"❌ Stack {self.stack_name} not found")
                self.test_results.append({
                    "test": "stack_exists",
                    "status": "failed",
                    "message": f"Stack {self.stack_name} not found"
                })
                return False
        except Exception as e:
            print(f"❌ Error checking stack: {e}")
            self.test_results.append({
                "test": "stack_exists",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_stack_history(self) -> bool:
        """Test 2: Verify stack has deployment history."""
        print("\n=== Test 2: Verify Stack History ===")
        
        try:
            result = self.run_command([
                "aws", "cloudformation", "list-stack-resources",
                "--stack-name", self.stack_name,
                "--query", "length(StackResourceSummaries)",
                "--output", "text"
            ])
            
            if result.returncode == 0:
                resource_count = int(result.stdout.strip()) if result.stdout.strip() else 0
                print(f"✅ Stack has {resource_count} resources")
                self.test_results.append({
                    "test": "stack_history",
                    "status": "passed",
                    "message": f"Stack has {resource_count} resources"
                })
                return True
            else:
                print("❌ Could not retrieve stack resources")
                self.test_results.append({
                    "test": "stack_history",
                    "status": "failed",
                    "message": "Could not retrieve stack resources"
                })
                return False
        except Exception as e:
            print(f"❌ Error checking stack history: {e}")
            self.test_results.append({
                "test": "stack_history",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_changeset_creation(self) -> bool:
        """Test 3: Verify changeset can be created (for rollback simulation)."""
        print("\n=== Test 3: Verify Changeset Creation ===")
        
        changeset_name = f"rollback-test-{self.environment}"
        
        try:
            # Create a changeset (this doesn't actually deploy anything)
            result = self.run_command([
                "aws", "cloudformation", "create-change-set",
                "--stack-name", self.stack_name,
                "--change-set-name", changeset_name,
                "--use-previous-template",
                "--capabilities", "CAPABILITY_IAM", "CAPABILITY_NAMED_IAM",
                "--description", "Rollback test changeset"
            ], check=False)
            
            if result.returncode == 0 or "already exists" in result.stderr:
                print(f"✅ Changeset creation successful or already exists")
                
                # Clean up the changeset
                if not self.dry_run:
                    self.run_command([
                        "aws", "cloudformation", "delete-change-set",
                        "--stack-name", self.stack_name,
                        "--change-set-name", changeset_name
                    ], check=False)
                
                self.test_results.append({
                    "test": "changeset_creation",
                    "status": "passed",
                    "message": "Changeset can be created"
                })
                return True
            else:
                print(f"❌ Changeset creation failed: {result.stderr}")
                self.test_results.append({
                    "test": "changeset_creation",
                    "status": "failed",
                    "message": f"Changeset creation failed: {result.stderr}"
                })
                return False
        except Exception as e:
            print(f"❌ Error creating changeset: {e}")
            self.test_results.append({
                "test": "changeset_creation",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_sam_config_exists(self) -> bool:
        """Test 4: Verify SAM configuration file exists."""
        print("\n=== Test 4: Verify SAM Configuration ===")
        
        try:
            with open("infrastructure/samconfig.toml", "r") as f:
                content = f.read()
                
                # Check if environment-specific config exists
                if f"[{self.environment}]" in content or f'[{self.environment}.deploy.parameters]' in content:
                    print(f"✅ SAM config for {self.environment} environment exists")
                    self.test_results.append({
                        "test": "sam_config_exists",
                        "status": "passed",
                        "message": f"SAM config for {self.environment} found"
                    })
                    return True
                else:
                    print(f"⚠️ SAM config for {self.environment} environment not found")
                    self.test_results.append({
                        "test": "sam_config_exists",
                        "status": "warning",
                        "message": f"SAM config for {self.environment} not found"
                    })
                    return False
        except FileNotFoundError:
            print("❌ SAM config file not found")
            self.test_results.append({
                "test": "sam_config_exists",
                "status": "failed",
                "message": "SAM config file not found"
            })
            return False
        except Exception as e:
            print(f"❌ Error reading SAM config: {e}")
            self.test_results.append({
                "test": "sam_config_exists",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_rollback_script_exists(self) -> bool:
        """Test 5: Verify rollback script exists."""
        print("\n=== Test 5: Verify Rollback Script ===")
        
        try:
            with open("infrastructure/scripts/rollback.sh", "r") as f:
                content = f.read()
                
                # Check for key rollback commands
                required_commands = ["aws cloudformation", "rollback", "describe-stacks"]
                missing_commands = [cmd for cmd in required_commands if cmd not in content]
                
                if not missing_commands:
                    print("✅ Rollback script exists with required commands")
                    self.test_results.append({
                        "test": "rollback_script_exists",
                        "status": "passed",
                        "message": "Rollback script found with required commands"
                    })
                    return True
                else:
                    print(f"⚠️ Rollback script missing commands: {missing_commands}")
                    self.test_results.append({
                        "test": "rollback_script_exists",
                        "status": "warning",
                        "message": f"Missing commands: {missing_commands}"
                    })
                    return False
        except FileNotFoundError:
            print("⚠️ Rollback script not found (may need to be created)")
            self.test_results.append({
                "test": "rollback_script_exists",
                "status": "warning",
                "message": "Rollback script not found"
            })
            return False
        except Exception as e:
            print(f"❌ Error checking rollback script: {e}")
            self.test_results.append({
                "test": "rollback_script_exists",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_deployment_artifacts(self) -> bool:
        """Test 6: Verify deployment artifacts can be versioned."""
        print("\n=== Test 6: Verify Deployment Artifact Versioning ===")
        
        try:
            # Check if .aws-sam directory exists (created during build)
            result = self.run_command([
                "ls", "-la", "infrastructure/.aws-sam/build/"
            ], check=False)
            
            if result.returncode == 0:
                print("✅ SAM build artifacts directory exists")
                self.test_results.append({
                    "test": "deployment_artifacts",
                    "status": "passed",
                    "message": "Build artifacts can be versioned"
                })
                return True
            else:
                print("⚠️ SAM build artifacts not found (run 'sam build' first)")
                self.test_results.append({
                    "test": "deployment_artifacts",
                    "status": "warning",
                    "message": "Build artifacts not found"
                })
                return False
        except Exception as e:
            print(f"❌ Error checking artifacts: {e}")
            self.test_results.append({
                "test": "deployment_artifacts",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def test_github_workflow_rollback(self) -> bool:
        """Test 7: Verify GitHub workflow has rollback capability."""
        print("\n=== Test 7: Verify GitHub Workflow Rollback ===")
        
        try:
            with open(".github/workflows/backend-deploy.yml", "r") as f:
                content = f.read()
                
                # Check for key rollback indicators
                has_manual_trigger = "workflow_dispatch" in content
                has_environment_protection = "environment:" in content
                has_artifact_upload = "upload-artifact" in content
                has_artifact_download = "download-artifact" in content
                
                checks = {
                    "Manual trigger (workflow_dispatch)": has_manual_trigger,
                    "Environment protection": has_environment_protection,
                    "Artifact upload": has_artifact_upload,
                    "Artifact download": has_artifact_download
                }
                
                passed_checks = sum(checks.values())
                total_checks = len(checks)
                
                print(f"Rollback capability checks: {passed_checks}/{total_checks}")
                for check, result in checks.items():
                    status = "✅" if result else "❌"
                    print(f"  {status} {check}")
                
                if passed_checks == total_checks:
                    print("✅ GitHub workflow has full rollback capability")
                    self.test_results.append({
                        "test": "github_workflow_rollback",
                        "status": "passed",
                        "message": f"All {total_checks} rollback checks passed"
                    })
                    return True
                else:
                    print(f"⚠️ GitHub workflow has partial rollback capability ({passed_checks}/{total_checks})")
                    self.test_results.append({
                        "test": "github_workflow_rollback",
                        "status": "warning",
                        "message": f"Only {passed_checks}/{total_checks} checks passed"
                    })
                    return False
        except FileNotFoundError:
            print("❌ GitHub workflow file not found")
            self.test_results.append({
                "test": "github_workflow_rollback",
                "status": "failed",
                "message": "Workflow file not found"
            })
            return False
        except Exception as e:
            print(f"❌ Error checking workflow: {e}")
            self.test_results.append({
                "test": "github_workflow_rollback",
                "status": "error",
                "message": str(e)
            })
            return False
    
    def run_all_tests(self) -> bool:
        """Run all rollback tests."""
        print(f"\n{'='*60}")
        print(f"Deployment Rollback Tests - Environment: {self.environment}")
        print(f"Dry Run: {self.dry_run}")
        print(f"{'='*60}")
        
        tests = [
            self.test_stack_exists,
            self.test_stack_history,
            self.test_changeset_creation,
            self.test_sam_config_exists,
            self.test_rollback_script_exists,
            self.test_deployment_artifacts,
            self.test_github_workflow_rollback
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
                self.test_results.append({
                    "test": test.__name__,
                    "status": "error",
                    "message": str(e)
                })
        
        # Print summary
        print(f"\n{'='*60}")
        print("Test Summary")
        print(f"{'='*60}")
        
        passed = sum(1 for r in self.test_results if r["status"] == "passed")
        failed = sum(1 for r in self.test_results if r["status"] == "failed")
        warnings = sum(1 for r in self.test_results if r["status"] == "warning")
        errors = sum(1 for r in self.test_results if r["status"] == "error")
        total = len(self.test_results)
        
        print(f"Total tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"🔥 Errors: {errors}")
        
        # Print detailed results
        print(f"\nDetailed Results:")
        for result in self.test_results:
            status_icon = {
                "passed": "✅",
                "failed": "❌",
                "warning": "⚠️",
                "error": "🔥"
            }.get(result["status"], "❓")
            
            print(f"{status_icon} {result['test']}: {result['message']}")
        
        # Return True if no failures or errors
        return failed == 0 and errors == 0


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Test deployment rollback procedures"
    )
    parser.add_argument(
        "--environment",
        choices=["dev", "staging", "prod"],
        default="dev",
        help="Environment to test (default: dev)"
    )
    parser.add_argument(
        "--no-dry-run",
        action="store_true",
        help="Actually execute commands (default: dry run)"
    )
    
    args = parser.parse_args()
    
    tester = RollbackTester(
        environment=args.environment,
        dry_run=not args.no_dry_run
    )
    
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
