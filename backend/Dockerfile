FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for fitz, ocr, and database clients
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY ai_engine /app/ai_engine
COPY storage /app/storage

ENV PYTHONPATH=/app/backend:/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
