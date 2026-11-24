import sys
import os
from pathlib import Path

# Resolve root directory
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Configure Vercel serverless environment paths
# /tmp is the only writable filesystem in AWS Lambda / Vercel Serverless
if os.getenv("VERCEL") or "/var/task" in str(root_dir):
    os.environ["ENVIRONMENT"] = "production"
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url or "sqlite:///." in db_url:
        os.environ["DATABASE_URL"] = "sqlite:////tmp/title_escrow.db"
    
    storage_dir = os.getenv("STORAGE_LOCAL_DIR", "")
    if not storage_dir or storage_dir.startswith("./"):
        os.environ["STORAGE_LOCAL_DIR"] = "/tmp/storage/documents"
        os.makedirs("/tmp/storage/documents", exist_ok=True)

from app.main import app

# Vercel ASGI serverless handler
# The FastAPI 'app' instance is directly exported for Vercel's Python runtime
