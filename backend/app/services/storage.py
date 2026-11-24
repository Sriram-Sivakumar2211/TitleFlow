import os
import shutil
import hashlib
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/tiff": ".tiff"
}

MAX_FILE_BYTES = settings.STORAGE_MAX_FILE_SIZE_MB * 1024 * 1024

class BaseStorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str, int, str]:
        """Returns (storage_path, sanitized_filename, file_size_bytes, sha256_hash)"""
        pass

    @abstractmethod
    def get_file_path(self, storage_path: str) -> str:
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        pass

class LocalStorageProvider(BaseStorageProvider):
    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or settings.STORAGE_LOCAL_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str, int, str]:
        # Generate safe unique filename
        ext = Path(original_filename).suffix.lower()
        unique_id = uuid.uuid4().hex
        stored_filename = f"{unique_id}{ext}"
        destination_path = self.base_dir / stored_filename

        hasher = hashlib.sha256()
        total_bytes = 0

        file_obj.seek(0)
        with open(destination_path, "wb") as f_out:
            while chunk := file_obj.read(1024 * 64):
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_BYTES:
                    # Clean up partial file
                    f_out.close()
                    if destination_path.exists():
                        destination_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.STORAGE_MAX_FILE_SIZE_MB}MB"
                    )
                hasher.update(chunk)
                f_out.write(chunk)

        file_hash = hasher.hexdigest()
        return str(destination_path), stored_filename, total_bytes, file_hash

    def get_file_path(self, storage_path: str) -> str:
        path = Path(storage_path).resolve()
        # Security: Prevent directory traversal outside base_dir
        if not str(path).startswith(str(self.base_dir)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Invalid storage path traversal"
            )
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stored document file not found on disk"
            )
        return str(path)

    def delete_file(self, storage_path: str) -> bool:
        try:
            path = Path(self.get_file_path(storage_path))
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception:
            return False

class S3StorageProvider(BaseStorageProvider):
    """Ready abstraction for Amazon S3 or MinIO object storage"""
    def __init__(self, bucket_name: str = "title-escrow-documents"):
        self.bucket_name = bucket_name

    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str, int, str]:
        raise NotImplementedError("S3 storage provider is configured for future production cloud deployment")

    def get_file_path(self, storage_path: str) -> str:
        raise NotImplementedError("S3 storage provider is configured for future production cloud deployment")

    def delete_file(self, storage_path: str) -> bool:
        raise NotImplementedError("S3 storage provider is configured for future production cloud deployment")

def get_storage_provider() -> BaseStorageProvider:
    if settings.STORAGE_BACKEND == "s3":
        return S3StorageProvider()
    return LocalStorageProvider()
