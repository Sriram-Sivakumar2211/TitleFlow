import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Add project root directory to sys.path for ai_engine
root_dir = backend_dir.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
