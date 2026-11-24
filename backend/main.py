import os
import sys
from pathlib import Path

# Add current directory to sys.path for direct imports
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure Vercel serverless environment paths
if os.getenv("VERCEL") or "/var/task" in str(backend_dir):
    os.environ["ENVIRONMENT"] = "production"
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url or "sqlite:///." in db_url:
        os.environ["DATABASE_URL"] = "sqlite:////tmp/title_escrow.db"
    storage_dir = os.getenv("STORAGE_LOCAL_DIR", "")
    if not storage_dir or storage_dir.startswith("./"):
        os.environ["STORAGE_LOCAL_DIR"] = "/tmp/storage/documents"
        os.makedirs("/tmp/storage/documents", exist_ok=True)

from app.main import app

__all__ = ["app"]
