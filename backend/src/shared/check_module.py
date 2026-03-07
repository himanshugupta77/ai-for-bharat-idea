import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

print("Attempting to import test_security...")
from shared import test_security

print(f"Module: {test_security}")
print(f"Module file: {test_security.__file__}")
print(f"Module attributes: {[attr for attr in dir(test_security) if not attr.startswith('_')]}")

# Check if classes are defined
import inspect
classes = [name for name, obj in inspect.getmembers(test_security, inspect.isclass)]
print(f"Classes in module: {classes}")
