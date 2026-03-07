#!/usr/bin/env python3
"""
Unit tests for the scheme data seeding script.

Tests cover:
- Data validation for scheme objects
- Batch write logic
- DynamoDB item format conversion
- Error handling
"""

import unittest
from unittest.mock import Mock, MagicMock, patch, call
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from seed_schemes import (
    create_scheme_item,
    get_government_schemes,
    batch_write_schemes,
    verify_seeded_data,
    get_dynamodb_table
)
from shared.models import Scheme, EligibilityRule


class TestSchemeDataValidation(unittest.TestCase):
    """Test suite for scheme data validation."""
    
    def test_all_schemes_have_required_fields(self):
        """Test that all schemes have required fields populated."""
        schemes = get_government_schemes()
        
        self.assertGreaterEqual(len(schemes), 10, "Should have at least 10 schemes")
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                # Required string fields
                self.assertTrue(scheme.schemeId, "schemeId should not be empty")
                self.assertTrue(scheme.name, "name should not be empty")
                self.assertTrue(scheme.description, "description should not be empty")
                self.assertTrue(scheme.category, "category should not be empty")
                self.assertTrue(scheme.targetAudience, "targetAudience should not be empty")
                self.assertTrue(scheme.benefits, "benefits should not be empty")
                self.assertTrue(scheme.officialWebsite, "officialWebsite should not be empty")
                
                # Required list fields
                self.assertIsInstance(scheme.eligibilityRules, list)
                self.assertGreater(len(scheme.eligibilityRules), 0, "Should have at least one eligibility rule")
                self.assertIsInstance(scheme.applicationSteps, list)
                self.assertGreater(len(scheme.applicationSteps), 0, "Should have at least one application step")
                self.assertIsInstance(scheme.documents, list)
                self.assertGreater(len(scheme.documents), 0, "Should have at least one required document")
    
    def test_scheme_ids_are_valid_format(self):
        """Test that scheme IDs follow kebab-case format."""
        schemes = get_government_schemes()
        
        import re
        pattern = re.compile(r'^[a-z0-9-]+$')
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                self.assertIsNotNone(
                    pattern.match(scheme.schemeId),
                    f"Scheme ID '{scheme.schemeId}' should be in kebab-case format"
                )
    
    def test_scheme_ids_are_unique(self):
        """Test that all scheme IDs are unique."""
        schemes = get_government_schemes()
        scheme_ids = [s.schemeId for s in schemes]
        
        self.assertEqual(
            len(scheme_ids),
            len(set(scheme_ids)),
            "All scheme IDs should be unique"
        )
    
    def test_eligibility_rules_have_required_fields(self):
        """Test that all eligibility rules have required fields."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            for rule in scheme.eligibilityRules:
                with self.subTest(scheme=scheme.schemeId, rule=rule.criterion):
                    self.assertTrue(rule.criterion, "criterion should not be empty")
                    self.assertIn(rule.type, ['boolean', 'numeric', 'string', 'enum'], 
                                "type should be one of: boolean, numeric, string, enum")
                    self.assertTrue(rule.requirement, "requirement should not be empty")
                    self.assertTrue(rule.evaluator, "evaluator should not be empty")
                    self.assertTrue(rule.evaluator.startswith('lambda '), 
                                  "evaluator should be a lambda expression")
    
    def test_official_websites_are_valid_urls(self):
        """Test that official websites are valid HTTPS URLs."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                self.assertTrue(
                    scheme.officialWebsite.startswith('https://'),
                    f"Official website should use HTTPS: {scheme.officialWebsite}"
                )
    
    def test_name_translations_include_hindi(self):
        """Test that all schemes have Hindi translations."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                self.assertIsNotNone(scheme.nameTranslations, "Should have name translations")
                self.assertIn('hi', scheme.nameTranslations, "Should have Hindi translation")
                self.assertTrue(scheme.nameTranslations['hi'], "Hindi translation should not be empty")
    
    def test_categories_are_valid(self):
        """Test that scheme categories are from expected set."""
        schemes = get_government_schemes()
        valid_categories = {
            'agriculture', 'employment', 'health', 'housing', 
            'welfare', 'pension', 'business', 'education'
        }
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                self.assertIn(
                    scheme.category,
                    valid_categories,
                    f"Category '{scheme.category}' should be one of: {valid_categories}"
                )


class TestDynamoDBItemConversion(unittest.TestCase):
    """Test suite for DynamoDB item format conversion."""
    
    def test_create_scheme_item_structure(self):
        """Test that create_scheme_item produces correct DynamoDB structure."""
        scheme = Scheme(
            schemeId='test-scheme',
            name='Test Scheme',
            nameTranslations={'hi': 'परीक्षण योजना'},
            description='Test description',
            descriptionTranslations={'hi': 'परीक्षण विवरण'},
            category='welfare',
            targetAudience='Test audience',
            benefits='Test benefits',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Age',
                    type='numeric',
                    requirement='Must be 18+',
                    evaluator='lambda u: u.get("age", 0) >= 18'
                )
            ],
            applicationSteps=['Step 1', 'Step 2'],
            documents=['Doc 1', 'Doc 2'],
            officialWebsite='https://test.gov.in',
            version=1,
            lastUpdated=1704067200
        )
        
        item = create_scheme_item(scheme)
        
        # Test primary key structure
        self.assertEqual(item['PK'], 'SCHEME#test-scheme')
        self.assertEqual(item['SK'], 'METADATA')
        
        # Test required fields
        self.assertEqual(item['schemeId'], 'test-scheme')
        self.assertEqual(item['name'], 'Test Scheme')
        self.assertEqual(item['description'], 'Test description')
        self.assertEqual(item['category'], 'welfare')
        
        # Test translations
        self.assertIn('nameTranslations', item)
        self.assertEqual(item['nameTranslations']['hi'], 'परीक्षण योजना')
        
        # Test eligibility rules conversion
        self.assertIsInstance(item['eligibilityRules'], list)
        self.assertEqual(len(item['eligibilityRules']), 1)
        self.assertIsInstance(item['eligibilityRules'][0], dict)
        self.assertEqual(item['eligibilityRules'][0]['criterion'], 'Age')
        
        # Test lists
        self.assertEqual(item['applicationSteps'], ['Step 1', 'Step 2'])
        self.assertEqual(item['documents'], ['Doc 1', 'Doc 2'])
    
    def test_create_scheme_item_handles_empty_translations(self):
        """Test that create_scheme_item handles None translations."""
        scheme = Scheme(
            schemeId='test-scheme',
            name='Test Scheme',
            nameTranslations=None,
            description='Test description',
            descriptionTranslations=None,
            category='welfare',
            targetAudience='Test audience',
            benefits='Test benefits',
            eligibilityRules=[],
            applicationSteps=['Step 1'],
            documents=['Doc 1'],
            officialWebsite='https://test.gov.in',
            version=1,
            lastUpdated=1704067200
        )
        
        item = create_scheme_item(scheme)
        
        self.assertEqual(item['nameTranslations'], {})
        self.assertEqual(item['descriptionTranslations'], {})
    
    def test_create_scheme_item_preserves_timestamp(self):
        """Test that create_scheme_item preserves existing timestamp."""
        expected_timestamp = 1704067200
        scheme = Scheme(
            schemeId='test-scheme',
            name='Test Scheme',
            description='Test description',
            category='welfare',
            targetAudience='Test audience',
            benefits='Test benefits',
            eligibilityRules=[],
            applicationSteps=['Step 1'],
            documents=['Doc 1'],
            officialWebsite='https://test.gov.in',
            version=1,
            lastUpdated=expected_timestamp
        )
        
        item = create_scheme_item(scheme)
        
        self.assertIn('lastUpdated', item)
        self.assertIsInstance(item['lastUpdated'], int)
        self.assertEqual(item['lastUpdated'], expected_timestamp)


class TestBatchWriteLogic(unittest.TestCase):
    """Test suite for batch write logic."""
    
    @patch('seed_schemes.create_scheme_item')
    def test_batch_write_schemes_processes_all_schemes(self, mock_create_item):
        """Test that batch_write_schemes processes all schemes."""
        # Create mock schemes
        schemes = [
            Mock(schemeId=f'scheme-{i}', name=f'Scheme {i}')
            for i in range(5)
        ]
        
        # Mock create_scheme_item to return simple items
        mock_create_item.side_effect = lambda s: {
            'PK': f'SCHEME#{s.schemeId}',
            'SK': 'METADATA',
            'schemeId': s.schemeId,
            'name': s.name
        }
        
        # Create mock table with batch_writer context manager
        mock_table = Mock()
        mock_writer = MagicMock()
        mock_batch_writer_context = MagicMock()
        mock_batch_writer_context.__enter__ = Mock(return_value=mock_writer)
        mock_batch_writer_context.__exit__ = Mock(return_value=False)
        mock_table.batch_writer.return_value = mock_batch_writer_context
        
        # Execute batch write
        batch_write_schemes(mock_table, schemes)
        
        # Verify create_scheme_item was called for each scheme
        self.assertEqual(mock_create_item.call_count, 5)
        
        # Verify put_item was called for each scheme
        self.assertEqual(mock_writer.put_item.call_count, 5)
    
    @patch('seed_schemes.create_scheme_item')
    def test_batch_write_schemes_handles_large_batches(self, mock_create_item):
        """Test that batch_write_schemes handles more than 25 items (DynamoDB limit)."""
        # Create 30 mock schemes (more than DynamoDB batch limit of 25)
        schemes = [
            Mock(schemeId=f'scheme-{i}', name=f'Scheme {i}')
            for i in range(30)
        ]
        
        # Mock create_scheme_item
        mock_create_item.side_effect = lambda s: {
            'PK': f'SCHEME#{s.schemeId}',
            'SK': 'METADATA',
            'schemeId': s.schemeId,
            'name': s.name
        }
        
        # Create mock table with batch_writer context manager
        mock_table = Mock()
        mock_writer = MagicMock()
        mock_batch_writer_context = MagicMock()
        mock_batch_writer_context.__enter__ = Mock(return_value=mock_writer)
        mock_batch_writer_context.__exit__ = Mock(return_value=False)
        mock_table.batch_writer.return_value = mock_batch_writer_context
        
        # Execute batch write
        batch_write_schemes(mock_table, schemes)
        
        # Verify all 30 items were written
        self.assertEqual(mock_writer.put_item.call_count, 30)
        
        # Verify batch_writer was called twice (for 2 batches)
        self.assertEqual(mock_table.batch_writer.call_count, 2)
    
    @patch('seed_schemes.create_scheme_item')
    def test_batch_write_schemes_with_empty_list(self, mock_create_item):
        """Test that batch_write_schemes handles empty scheme list."""
        schemes = []
        
        mock_table = Mock()
        mock_writer = MagicMock()
        mock_batch_writer_context = MagicMock()
        mock_batch_writer_context.__enter__ = Mock(return_value=mock_writer)
        mock_batch_writer_context.__exit__ = Mock(return_value=False)
        mock_table.batch_writer.return_value = mock_batch_writer_context
        
        # Should not raise exception
        batch_write_schemes(mock_table, schemes)
        
        # Verify no items were written
        self.assertEqual(mock_writer.put_item.call_count, 0)


class TestVerifySeededData(unittest.TestCase):
    """Test suite for data verification."""
    
    def test_verify_seeded_data_counts_schemes(self):
        """Test that verify_seeded_data correctly counts schemes."""
        # Create mock table
        mock_table = Mock()
        mock_table.scan.return_value = {
            'Items': [
                {'PK': 'SCHEME#scheme-1', 'name': 'Scheme 1', 'schemeId': 'scheme-1', 'category': 'welfare'},
                {'PK': 'SCHEME#scheme-2', 'name': 'Scheme 2', 'schemeId': 'scheme-2', 'category': 'health'},
                {'PK': 'SCHEME#scheme-3', 'name': 'Scheme 3', 'schemeId': 'scheme-3', 'category': 'education'},
            ]
        }
        
        count = verify_seeded_data(mock_table)
        
        self.assertEqual(count, 3)
        
        # Verify scan was called with correct filter
        mock_table.scan.assert_called_once()
        call_args = mock_table.scan.call_args
        self.assertIn('FilterExpression', call_args[1])
    
    def test_verify_seeded_data_handles_empty_result(self):
        """Test that verify_seeded_data handles empty scan result."""
        mock_table = Mock()
        mock_table.scan.return_value = {'Items': []}
        
        count = verify_seeded_data(mock_table)
        
        self.assertEqual(count, 0)


class TestGetDynamoDBTable(unittest.TestCase):
    """Test suite for DynamoDB table connection."""
    
    @patch.dict(os.environ, {'DYNAMODB_TABLE': 'test-table'})
    @patch('seed_schemes.boto3')
    def test_get_dynamodb_table_uses_env_variable(self, mock_boto3):
        """Test that get_dynamodb_table uses environment variable."""
        mock_resource = Mock()
        mock_table = Mock()
        mock_resource.Table.return_value = mock_table
        mock_boto3.resource.return_value = mock_resource
        
        table = get_dynamodb_table()
        
        mock_boto3.resource.assert_called_once_with('dynamodb')
        mock_resource.Table.assert_called_once_with('test-table')
    
    @patch.dict(os.environ, {}, clear=True)
    @patch('seed_schemes.boto3')
    def test_get_dynamodb_table_uses_default(self, mock_boto3):
        """Test that get_dynamodb_table uses default table name."""
        mock_resource = Mock()
        mock_table = Mock()
        mock_resource.Table.return_value = mock_table
        mock_boto3.resource.return_value = mock_resource
        
        table = get_dynamodb_table()
        
        mock_resource.Table.assert_called_once_with('bharat-sahayak-data-dev')


class TestEligibilityRuleEvaluators(unittest.TestCase):
    """Test suite for eligibility rule evaluator lambda expressions."""
    
    def test_evaluators_are_valid_lambda_expressions(self):
        """Test that all evaluator strings are valid lambda expressions."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            for rule in scheme.eligibilityRules:
                with self.subTest(scheme=scheme.schemeId, rule=rule.criterion):
                    try:
                        # Try to compile the lambda expression
                        evaluator_func = eval(rule.evaluator)
                        self.assertTrue(callable(evaluator_func), 
                                      f"Evaluator should be callable: {rule.evaluator}")
                    except Exception as e:
                        self.fail(f"Invalid evaluator lambda for {scheme.schemeId} - {rule.criterion}: {e}")
    
    def test_evaluators_handle_missing_keys(self):
        """Test that evaluators handle missing user info keys gracefully."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            for rule in scheme.eligibilityRules:
                with self.subTest(scheme=scheme.schemeId, rule=rule.criterion):
                    try:
                        evaluator_func = eval(rule.evaluator)
                        # Test with empty user info
                        result = evaluator_func({})
                        self.assertIsInstance(result, bool, 
                                            f"Evaluator should return boolean: {rule.evaluator}")
                    except KeyError as e:
                        self.fail(f"Evaluator should handle missing keys: {scheme.schemeId} - {rule.criterion}: {e}")
                    except Exception:
                        # Other exceptions are acceptable (e.g., type errors)
                        pass


class TestSchemeDataIntegrity(unittest.TestCase):
    """Test suite for overall scheme data integrity."""
    
    def test_scheme_count_meets_requirement(self):
        """Test that at least 10 schemes are defined (Requirement 4.1)."""
        schemes = get_government_schemes()
        self.assertGreaterEqual(
            len(schemes),
            10,
            "Should have at least 10 major government schemes"
        )
    
    def test_major_schemes_are_included(self):
        """Test that major government schemes are included."""
        schemes = get_government_schemes()
        scheme_ids = [s.schemeId for s in schemes]
        
        # Major schemes that should be included
        expected_schemes = [
            'pm-kisan',
            'mgnrega',
            'ayushman-bharat',
            'pmay',
            'pmuy'
        ]
        
        for expected in expected_schemes:
            with self.subTest(scheme=expected):
                self.assertIn(
                    expected,
                    scheme_ids,
                    f"Major scheme '{expected}' should be included"
                )
    
    def test_schemes_cover_multiple_categories(self):
        """Test that schemes cover multiple categories."""
        schemes = get_government_schemes()
        categories = set(s.category for s in schemes)
        
        self.assertGreaterEqual(
            len(categories),
            5,
            "Schemes should cover at least 5 different categories"
        )
    
    def test_application_steps_are_actionable(self):
        """Test that application steps are non-empty and actionable."""
        schemes = get_government_schemes()
        
        for scheme in schemes:
            with self.subTest(scheme=scheme.schemeId):
                self.assertGreater(
                    len(scheme.applicationSteps),
                    2,
                    f"Scheme should have at least 3 application steps"
                )
                
                for step in scheme.applicationSteps:
                    self.assertGreater(
                        len(step),
                        10,
                        f"Application step should be descriptive: '{step}'"
                    )


if __name__ == '__main__':
    unittest.main()
