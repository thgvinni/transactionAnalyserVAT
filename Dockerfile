# Use Python slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY templates/ templates/

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run with gunicorn for production, use PORT env var
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 app:app"]