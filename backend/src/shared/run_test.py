import sys
import os
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    import test_security
    print("Module imported successfully")
    print("Module attributes:", dir(test_security))
    
    # Try to find test classes
    test_classes = [name for name in dir(test_security) if name.startswith('Test')]
    print(f"Test classes found: {test_classes}")
    
    if test_classes:
        import unittest
        loader = unittest.TestLoader()
        suite = loader.loadTestsFromModule(test_security)
        print(f"Tests loaded: {suite.countTestCases()}")
        
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        if result.wasSuccessful():
            print("\nAll tests passed!")
        else:
            print(f"\nTests failed: {len(result.failures)} failures, {len(result.errors)} errors")
    else:
        print("No test classes found!")
        
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
