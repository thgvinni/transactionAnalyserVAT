#!/bin/bash

# Local Docker testing script for Transaction Analyzer VAT
# Make sure to run: chmod +x local-test.sh

set -e

IMAGE_NAME="transaction-analyzer-vat"
CONTAINER_NAME="transaction-analyzer-vat-test"
PORT="8080"

echo "🐳 Building and testing Transaction Analyzer VAT locally"

# Clean up any existing container
echo "🧹 Cleaning up existing containers..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Run the container
echo "🚀 Starting container on port ${PORT}..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:8080 \
    ${IMAGE_NAME}:latest

# Wait for the container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "✅ Container is running successfully!"
    echo "🌐 Application is available at: http://localhost:${PORT}"
    echo ""
    echo "🔍 Container logs:"
    docker logs ${CONTAINER_NAME}
    echo ""
    echo "🧪 Testing health endpoint..."
    curl -f http://localhost:${PORT}/health && echo " - Health check passed!" || echo " - Health check failed!"
    echo ""
    echo "📝 To view logs: docker logs ${CONTAINER_NAME}"
    echo "🛑 To stop: docker stop ${CONTAINER_NAME}"
    echo "🗑️  To remove: docker rm ${CONTAINER_NAME}"
else
    echo "❌ Container failed to start"
    echo "🔍 Container logs:"
    docker logs ${CONTAINER_NAME}
    exit 1
fi