import sys
import os
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

print("Testing imports step by step...")

try:
    print("\n1. Importing json, os, sys, unittest...")
    import json
    import unittest
    from unittest.mock import Mock, patch
    print("   ✓ Success")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    traceback.print_exc()

try:
    print("\n2. Importing hypothesis...")
    from hypothesis import given, strategies as st, settings, assume
    print("   ✓ Success")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    traceback.print_exc()

try:
    print("\n3. Importing from shared.utils...")
    from shared.utils import (
        sanitize_input,
        sanitize_html,
        sanitize_text_for_storage,
        validate_language_code,
        validate_scheme_id,
        validate_audio_format,
        create_response
    )
    print("   ✓ Success")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    traceback.print_exc()

print("\n4. Now trying to import the full test_security module...")
try:
    from shared import test_security
    print("   ✓ Module imported")
    print(f"   Module has {len(dir(test_security))} attributes")
    print(f"   Attributes: {[a for a in dir(test_security) if not a.startswith('_')]}")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    traceback.print_exc()

print("\n5. Trying to execute the file directly...")
try:
    with open('test_security.py', 'r') as f:
        code = f.read()
    exec(code)
    print("   ✓ File executed")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    traceback.print_exc()
