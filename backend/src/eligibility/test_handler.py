"""Unit tests for Eligibility Check Lambda function."""

import json
import pytest
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any
from hypothesis import given, strategies as st, settings

# Import the handler and classes
from .handler import (
    lambda_handler,
    EligibilityRule,
    SchemeRules,
    get_scheme,
    generate_explanation,
    get_alternative_schemes
)


class TestEligibilityRule:
    """Test cases for EligibilityRule class."""
    
    def test_boolean_rule_evaluation(self):
        """Test evaluation of boolean rules."""
        rule = EligibilityRule(
            criterion="Land Ownership",
            rule_type="boolean",
            requirement="Must own agricultural land",
            evaluator_str="lambda u: u.get('ownsLand', False)"
        )
        
        # Test with land ownership
        met, value = rule.evaluate({'ownsLand': True})
        assert met is True
        assert value == 'Yes'
        
        # Test without land ownership
        met, value = rule.evaluate({'ownsLand': False})
        assert met is False
        assert value == 'No'
    
    def test_numeric_comparison_rule(self):
        """Test evaluation of numeric comparison rules."""
        rule = EligibilityRule(
            criterion="Age Requirement",
            rule_type="numeric",
            requirement="Age must be between 18 and 60",
            evaluator_str="lambda u: 18 <= u.get('age', 0) <= 60"
        )
        
        # Test valid age
        met, value = rule.evaluate({'age': 30})
        assert met is True
        assert value == '30'
        
        # Test age too young
        met, value = rule.evaluate({'age': 15})
        assert met is False
        assert value == '15'
        
        # Test age too old
        met, value = rule.evaluate({'age': 65})
        assert met is False
        assert value == '65'
    
    def test_income_rule(self):
        """Test evaluation of income-based rules."""
        rule = EligibilityRule(
            criterion="Income Requirement",
            rule_type="numeric",
            requirement="Annual income must be ≤ ₹3,00,000",
            evaluator_str="lambda u: u.get('income', 0) <= 300000"
        )
        
        # Test eligible income
        met, value = rule.evaluate({'income': 250000})
        assert met is True
        assert value == '250000'
        
        # Test ineligible income
        met, value = rule.evaluate({'income': 400000})
        assert met is False
        assert value == '400000'
    
    def test_land_size_rule(self):
        """Test evaluation of land size rules."""
        rule = EligibilityRule(
            criterion="Land Size",
            rule_type="numeric",
            requirement="Land holding up to 2 hectares",
            evaluator_str="lambda u: u.get('landSize', 0) <= 2"
        )
        
        # Test eligible land size
        met, value = rule.evaluate({'landSize': 1.5})
        assert met is True
        assert value == '1.5'
        
        # Test ineligible land size
        met, value = rule.evaluate({'landSize': 3.0})
        assert met is False
        assert value == '3.0'
    
    def test_missing_field_with_default(self):
        """Test rule evaluation with missing fields."""
        rule = EligibilityRule(
            criterion="Land Ownership",
            rule_type="boolean",
            requirement="Must own land",
            evaluator_str="lambda u: u.get('ownsLand', False)"
        )
        
        # Test with missing field (should use default)
        met, value = rule.evaluate({})
        assert met is False
        assert value == 'No'


class TestSchemeRules:
    """Test cases for SchemeRules class."""
    
    def test_add_rule(self):
        """Test adding rules to SchemeRules."""
        scheme_rules = SchemeRules('test-scheme')
        
        rule = EligibilityRule(
            criterion="Test Criterion",
            rule_type="boolean",
            requirement="Test requirement",
            evaluator_str="lambda u: True"
        )
        
        scheme_rules.add_rule(rule)
        assert len(scheme_rules.rules) == 1
        assert scheme_rules.rules[0].criterion == "Test Criterion"
    
    def test_add_rule_from_dict(self):
        """Test adding rules from dictionary."""
        scheme_rules = SchemeRules('test-scheme')
        
        rule_dict = {
            'criterion': 'Age Requirement',
            'type': 'numeric',
            'requirement': 'Age must be 18+',
            'evaluator': 'lambda u: u.get("age", 0) >= 18'
        }
        
        scheme_rules.add_rule_from_dict(rule_dict)
        assert len(scheme_rules.rules) == 1
        assert scheme_rules.rules[0].criterion == "Age Requirement"
    
    def test_evaluate_all_eligible(self):
        """Test evaluation when all criteria are met."""
        scheme_rules = SchemeRules('pm-kisan')
        
        # Add rules
        scheme_rules.add_rule_from_dict({
            'criterion': 'Land Ownership',
            'type': 'boolean',
            'requirement': 'Must own land',
            'evaluator': 'lambda u: u.get("ownsLand", False)'
        })
        
        scheme_rules.add_rule_from_dict({
            'criterion': 'Land Size',
            'type': 'numeric',
            'requirement': 'Land ≤ 2 hectares',
            'evaluator': 'lambda u: u.get("landSize", 0) <= 2'
        })
        
        # Evaluate with eligible user
        user_info = {
            'ownsLand': True,
            'landSize': 1.5
        }
        
        result = scheme_rules.evaluate_all(user_info)
        
        assert result['eligible'] is True
        assert result['met_count'] == 2
        assert result['total_count'] == 2
        assert len(result['criteria']) == 2
    
    def test_evaluate_all_not_eligible(self):
        """Test evaluation when some criteria are not met."""
        scheme_rules = SchemeRules('pm-kisan')
        
        # Add rules
        scheme_rules.add_rule_from_dict({
            'criterion': 'Land Ownership',
            'type': 'boolean',
            'requirement': 'Must own land',
            'evaluator': 'lambda u: u.get("ownsLand", False)'
        })
        
        scheme_rules.add_rule_from_dict({
            'criterion': 'Land Size',
            'type': 'numeric',
            'requirement': 'Land ≤ 2 hectares',
            'evaluator': 'lambda u: u.get("landSize", 0) <= 2'
        })
        
        # Evaluate with ineligible user (no land)
        user_info = {
            'ownsLand': False,
            'landSize': 1.5
        }
        
        result = scheme_rules.evaluate_all(user_info)
        
        assert result['eligible'] is False
        assert result['met_count'] == 1
        assert result['total_count'] == 2


class TestGenerateExplanation:
    """Test cases for explanation generation."""
    
    def test_eligible_explanation(self):
        """Test explanation for eligible user."""
        criteria_results = [
            {
                'criterion': 'Age Requirement',
                'required': 'Age 18-60',
                'userValue': '30',
                'met': True
            },
            {
                'criterion': 'Income Requirement',
                'required': 'Income ≤ ₹3,00,000',
                'userValue': '250000',
                'met': True
            }
        ]
        
        explanation = generate_explanation(criteria_results, True, 2, 2)
        
        assert "eligible" in explanation.summary.lower()
        assert "meet all 2" in explanation.summary.lower()
        assert len(explanation.criteria) == 2
    
    def test_not_eligible_explanation_single_criterion(self):
        """Test explanation when one criterion is not met."""
        criteria_results = [
            {
                'criterion': 'Age Requirement',
                'required': 'Age 18-60',
                'userValue': '65',
                'met': False
            },
            {
                'criterion': 'Income Requirement',
                'required': 'Income ≤ ₹3,00,000',
                'userValue': '250000',
                'met': True
            }
        ]
        
        explanation = generate_explanation(criteria_results, False, 1, 2)
        
        assert "not eligible" in explanation.summary.lower()
        assert "1 out of 2" in explanation.summary.lower()
        assert "Age Requirement" in explanation.summary
    
    def test_not_eligible_explanation_multiple_criteria(self):
        """Test explanation when multiple criteria are not met."""
        criteria_results = [
            {
                'criterion': 'Age Requirement',
                'required': 'Age 18-60',
                'userValue': '65',
                'met': False
            },
            {
                'criterion': 'Income Requirement',
                'required': 'Income ≤ ₹3,00,000',
                'userValue': '400000',
                'met': False
            },
            {
                'criterion': 'Land Ownership',
                'required': 'Must own land',
                'userValue': 'No',
                'met': False
            }
        ]
        
        explanation = generate_explanation(criteria_results, False, 0, 3)
        
        assert "not eligible" in explanation.summary.lower()
        assert "3 out of 3" in explanation.summary.lower()
        assert "Age Requirement" in explanation.summary


@patch('eligibility.handler.get_dynamodb_table')
@patch('eligibility.handler.get_scheme')
class TestLambdaHandler:
    """Test cases for lambda_handler function."""
    
    def test_successful_eligibility_check_eligible(self, mock_get_scheme, mock_get_table):
        """Test successful eligibility check for eligible user."""
        # Mock scheme data
        mock_scheme = {
            'schemeId': 'pm-kisan',
            'name': 'PM-KISAN',
            'benefits': '₹6000 per year',
            'applicationSteps': ['Visit portal', 'Register', 'Apply'],
            'documents': ['Aadhaar', 'Land records'],
            'category': 'agriculture',
            'eligibilityRules': [
                {
                    'criterion': 'Land Ownership',
                    'type': 'boolean',
                    'requirement': 'Must own land',
                    'evaluator': 'lambda u: u.get("ownsLand", False)'
                },
                {
                    'criterion': 'Land Size',
                    'type': 'numeric',
                    'requirement': 'Land ≤ 2 hectares',
                    'evaluator': 'lambda u: u.get("landSize", 0) <= 2'
                }
            ]
        }
        
        mock_get_scheme.return_value = mock_scheme
        mock_get_table.return_value = Mock()
        
        # Create event
        event = {
            'body': json.dumps({
                'schemeId': 'pm-kisan',
                'userInfo': {
                    'ownsLand': True,
                    'landSize': 1.5
                }
            }),
            'requestContext': {
                'requestId': 'test-request-id'
            }
        }
        
        # Call handler
        response = lambda_handler(event, None)
        
        # Verify response
        assert response['statusCode'] == 200
        
        body = json.loads(response['body'])
        assert body['eligible'] is True
        assert body['schemeDetails']['name'] == 'PM-KISAN'
        assert len(body['explanation']['criteria']) == 2
        assert body['alternativeSchemes'] is None
    
    def test_successful_eligibility_check_not_eligible(self, mock_get_scheme, mock_get_table):
        """Test successful eligibility check for ineligible user."""
        # Mock scheme data
        mock_scheme = {
            'schemeId': 'pm-kisan',
            'name': 'PM-KISAN',
            'benefits': '₹6000 per year',
            'applicationSteps': ['Visit portal', 'Register', 'Apply'],
            'documents': ['Aadhaar', 'Land records'],
            'category': 'agriculture',
            'eligibilityRules': [
                {
                    'criterion': 'Land Ownership',
                    'type': 'boolean',
                    'requirement': 'Must own land',
                    'evaluator': 'lambda u: u.get("ownsLand", False)'
                }
            ]
        }
        
        mock_get_scheme.return_value = mock_scheme
        
        # Mock alternative schemes
        mock_table = Mock()
        mock_table.query.return_value = {
            'Items': [
                {
                    'schemeId': 'mgnrega',
                    'name': 'MGNREGA'
                }
            ]
        }
        mock_get_table.return_value = mock_table
        
        # Create event
        event = {
            'body': json.dumps({
                'schemeId': 'pm-kisan',
                'userInfo': {
                    'ownsLand': False
                }
            }),
            'requestContext': {
                'requestId': 'test-request-id'
            }
        }
        
        # Call handler
        response = lambda_handler(event, None)
        
        # Verify response
        assert response['statusCode'] == 200
        
        body = json.loads(response['body'])
        assert body['eligible'] is False
        assert 'not eligible' in body['explanation']['summary'].lower()
    
    def test_scheme_not_found(self, mock_get_scheme, mock_get_table):
        """Test handling of non-existent scheme."""
        mock_get_scheme.return_value = None
        mock_get_table.return_value = Mock()
        
        event = {
            'body': json.dumps({
                'schemeId': 'invalid-scheme',
                'userInfo': {
                    'age': 30
                }
            }),
            'requestContext': {
                'requestId': 'test-request-id'
            }
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['error'] == 'SchemeNotFound'
    
    def test_scheme_without_rules(self, mock_get_scheme, mock_get_table):
        """Test handling of scheme without eligibility rules."""
        mock_scheme = {
            'schemeId': 'test-scheme',
            'name': 'Test Scheme',
            'eligibilityRules': []
        }
        
        mock_get_scheme.return_value = mock_scheme
        mock_get_table.return_value = Mock()
        
        event = {
            'body': json.dumps({
                'schemeId': 'test-scheme',
                'userInfo': {
                    'age': 30
                }
            }),
            'requestContext': {
                'requestId': 'test-request-id'
            }
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert body['error'] == 'ConfigurationError'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])



# Property-Based Tests

class TestEligibilityDeterminism:
    """
    Property-based tests for eligibility check determinism.
    
    **Validates: Requirements 5.4, 8.1**
    
    These tests verify that the eligibility engine uses only rule-based logic
    without AI inference, ensuring deterministic and transparent decisions.
    """
    
    @given(
        age=st.integers(min_value=0, max_value=120),
        income=st.integers(min_value=0, max_value=10000000),
        land_size=st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False),
        owns_land=st.booleans(),
        scheme_id=st.sampled_from(['pm-kisan', 'test-scheme-1', 'test-scheme-2'])
    )
    @settings(max_examples=50, deadline=None)
    @patch('eligibility.handler.get_dynamodb_table')
    @patch('eligibility.handler.get_scheme')
    def test_property_7_eligibility_determinism(
        self,
        mock_get_scheme,
        mock_get_table,
        age,
        income,
        land_size,
        owns_land,
        scheme_id
    ):
        """
        Property 7: Eligibility determinism
        
        **Validates: Requirements 5.4, 8.1**
        
        Given the same user information and scheme ID, the eligibility check
        should always return the same result (eligible/not eligible) with the
        same explanation. This property verifies that:
        
        1. The rule-based engine is deterministic (no AI/ML randomness)
        2. Multiple invocations with identical inputs produce identical outputs
        3. The eligibility decision is based solely on transparent rules
        4. No non-deterministic factors influence the decision
        
        This ensures compliance with Requirements 5.4 (rule-based logic only)
        and 8.1 (transparent rule-based logic for all decisions).
        """
        # Setup: Create consistent mock scheme data
        mock_scheme = {
            'schemeId': scheme_id,
            'name': f'Test Scheme {scheme_id}',
            'benefits': 'Test benefits',
            'applicationSteps': ['Step 1', 'Step 2'],
            'documents': ['Doc 1', 'Doc 2'],
            'category': 'agriculture',
            'eligibilityRules': [
                {
                    'criterion': 'Age Requirement',
                    'type': 'numeric',
                    'requirement': 'Age must be between 18 and 60',
                    'evaluator': 'lambda u: 18 <= u.get("age", 0) <= 60'
                },
                {
                    'criterion': 'Income Requirement',
                    'type': 'numeric',
                    'requirement': 'Annual income must be ≤ ₹3,00,000',
                    'evaluator': 'lambda u: u.get("income", 0) <= 300000'
                },
                {
                    'criterion': 'Land Ownership',
                    'type': 'boolean',
                    'requirement': 'Must own agricultural land',
                    'evaluator': 'lambda u: u.get("ownsLand", False)'
                },
                {
                    'criterion': 'Land Size',
                    'type': 'numeric',
                    'requirement': 'Land holding up to 2 hectares',
                    'evaluator': 'lambda u: u.get("landSize", 0) <= 2'
                }
            ]
        }
        
        # Mock DynamoDB responses
        mock_get_scheme.return_value = mock_scheme
        mock_table = Mock()
        mock_table.query.return_value = {'Items': []}
        mock_get_table.return_value = mock_table
        
        # Create user info
        user_info = {
            'age': age,
            'income': income,
            'landSize': land_size,
            'ownsLand': owns_land
        }
        
        # Create event
        event = {
            'body': json.dumps({
                'schemeId': scheme_id,
                'userInfo': user_info
            }),
            'requestContext': {
                'requestId': 'test-request-id'
            },
            'headers': {
                'X-Session-Id': 'test-session-id'
            }
        }
        
        # Execute the eligibility check multiple times with identical inputs
        response1 = lambda_handler(event, None)
        response2 = lambda_handler(event, None)
        response3 = lambda_handler(event, None)
        
        # Verify all responses are successful
        assert response1['statusCode'] == 200, "First call should succeed"
        assert response2['statusCode'] == 200, "Second call should succeed"
        assert response3['statusCode'] == 200, "Third call should succeed"
        
        # Parse response bodies
        body1 = json.loads(response1['body'])
        body2 = json.loads(response2['body'])
        body3 = json.loads(response3['body'])
        
        # Property: Eligibility decision must be identical across all invocations
        assert body1['eligible'] == body2['eligible'] == body3['eligible'], \
            "Eligibility decision must be deterministic across multiple invocations"
        
        # Property: Explanation summary must be identical
        assert body1['explanation']['summary'] == body2['explanation']['summary'] == body3['explanation']['summary'], \
            "Explanation summary must be deterministic"
        
        # Property: Number of criteria must be identical
        assert len(body1['explanation']['criteria']) == len(body2['explanation']['criteria']) == len(body3['explanation']['criteria']), \
            "Number of criteria must be consistent"
        
        # Property: Each criterion evaluation must be identical
        for i in range(len(body1['explanation']['criteria'])):
            criterion1 = body1['explanation']['criteria'][i]
            criterion2 = body2['explanation']['criteria'][i]
            criterion3 = body3['explanation']['criteria'][i]
            
            assert criterion1['criterion'] == criterion2['criterion'] == criterion3['criterion'], \
                f"Criterion name must be identical at index {i}"
            
            assert criterion1['met'] == criterion2['met'] == criterion3['met'], \
                f"Criterion 'met' status must be deterministic for {criterion1['criterion']}"
            
            assert criterion1['userValue'] == criterion2['userValue'] == criterion3['userValue'], \
                f"User value must be identical for {criterion1['criterion']}"
            
            assert criterion1['required'] == criterion2['required'] == criterion3['required'], \
                f"Required value must be identical for {criterion1['criterion']}"
        
        # Property: Scheme details must be identical
        assert body1['schemeDetails']['name'] == body2['schemeDetails']['name'] == body3['schemeDetails']['name'], \
            "Scheme name must be consistent"
        
        assert body1['schemeDetails']['benefits'] == body2['schemeDetails']['benefits'] == body3['schemeDetails']['benefits'], \
            "Scheme benefits must be consistent"
        
        # Property: Alternative schemes (if present) must be identical
        if body1['alternativeSchemes'] is not None:
            assert body2['alternativeSchemes'] is not None, \
                "Alternative schemes presence must be deterministic"
            assert body3['alternativeSchemes'] is not None, \
                "Alternative schemes presence must be deterministic"
            
            assert len(body1['alternativeSchemes']) == len(body2['alternativeSchemes']) == len(body3['alternativeSchemes']), \
                "Number of alternative schemes must be consistent"
        else:
            assert body2['alternativeSchemes'] is None, \
                "Alternative schemes absence must be deterministic"
            assert body3['alternativeSchemes'] is None, \
                "Alternative schemes absence must be deterministic"
        
        # Additional verification: The decision should be based purely on rules
        # Calculate expected eligibility based on the rules
        expected_age_met = 18 <= age <= 60
        expected_income_met = income <= 300000
        expected_land_ownership_met = owns_land
        expected_land_size_met = land_size <= 2
        
        expected_eligible = (
            expected_age_met and 
            expected_income_met and 
            expected_land_ownership_met and 
            expected_land_size_met
        )
        
        # Verify the actual result matches the rule-based calculation
        assert body1['eligible'] == expected_eligible, \
            f"Eligibility decision must match rule-based calculation. " \
            f"Expected: {expected_eligible}, Got: {body1['eligible']} " \
            f"(age={age}, income={income}, landSize={land_size}, ownsLand={owns_land})"
        
        # Verify each criterion matches expected evaluation
        criteria_map = {c['criterion']: c for c in body1['explanation']['criteria']}
        
        assert criteria_map['Age Requirement']['met'] == expected_age_met, \
            f"Age criterion evaluation must match rule: age={age}, expected={expected_age_met}"
        
        assert criteria_map['Income Requirement']['met'] == expected_income_met, \
            f"Income criterion evaluation must match rule: income={income}, expected={expected_income_met}"
        
        assert criteria_map['Land Ownership']['met'] == expected_land_ownership_met, \
            f"Land ownership criterion evaluation must match rule: ownsLand={owns_land}, expected={expected_land_ownership_met}"
        
        assert criteria_map['Land Size']['met'] == expected_land_size_met, \
            f"Land size criterion evaluation must match rule: landSize={land_size}, expected={expected_land_size_met}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
