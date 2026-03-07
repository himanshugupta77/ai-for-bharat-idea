import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

print("Step 1: Importing standard libraries...")
import json
import unittest
from unittest.mock import Mock, patch
print("✓ Standard libraries imported")

print("\nStep 2: Importing hypothesis...")
from hypothesis import given, strategies as st, settings, assume
print("✓ Hypothesis imported")

print("\nStep 3: Importing shared.utils...")
try:
    from shared.utils import (
        sanitize_input,
        sanitize_html,
        sanitize_text_for_storage,
        validate_language_code,
        validate_scheme_id,
        validate_audio_format,
        create_response
    )
    print("✓ shared.utils imported")
except Exception as e:
    print(f"✗ Error importing shared.utils: {e}")
    import traceback
    traceback.print_exc()

print("\nStep 4: Defining test class...")
class TestInputSanitization(unittest.TestCase):
    def test_simple(self):
        self.assertTrue(True)

print("✓ Test class defined")

print("\nStep 5: Running test...")
suite = unittest.TestLoader().loadTestsFromTestCase(TestInputSanitization)
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)
